const User = require("../models/User");
const Incoming = require("../models/Incoming");
const Outgoing = require("../models/Outgoing");
const asyncHandler = require("express-async-handler");
const generateOutgoingId = require("../utils/generateOutgoingId.js");
const s3 = require("../config/s3");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// @desc Get all outgoing
// @route GET /outgoing
// @access Private
const getAllOutgoings = asyncHandler(async (req, res) => {
  const outgoing = await Outgoing.find().lean();
  if (!outgoing?.length) {
    return res.status(200).json([]); // ✅ Don't send 400
  }
  // return outgoing with status 200
  res.status(200).json(outgoing);
});

// @desc    Get a single outgoing by ID
// @route   GET /outgoings/:id
const getOutgoingById = async (req, res) => {
  try {
    const outgoing = await Outgoing.findById(req.params.id);

    if (!outgoing) {
      return res.status(404).json({ message: "Outgoing not found" });
    }

    res.json(outgoing);
  } catch (error) {
    console.error("Error fetching outgoing:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Create new outgoing
// @route POST /outgoing
// @access Private
const createNewOutgoing = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;
  const { to, from, date, purpose, passportNumber } = req.body;
  const attachment = req.file;

  if (!attachment) {
    return res.status(400).json({ message: "Attachment is required" });
  }

  // create the id for the outgoing
  const newId = await generateOutgoingId();
  const s3Key = `${newId}.pdf`;
  // console.log(newId);

  const uploadParams = {
    Bucket: bucketName,
    Key: s3Key,
    Body: attachment.buffer,
    ContentType: attachment.mimetype,
    ACL: "public-read", // ✅ allows public access
  };

  await s3.send(new PutObjectCommand(uploadParams));
  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  // Confirm data
  if (!to || !from || !date || !newId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create and store new outgoing
  const outgoing = await Outgoing.create({
    identifier: newId,
    to,
    from,
    date,
    purpose,
    passportNumber,
    attachment: s3Url, // store the file URL
  });

  if (outgoing) {
    res
      .status(201)
      .json({ message: `Outgoing with ID ${newId} created successfully!` });
  } else {
    res.status(400).json({ message: "Invalid outgoing data received" });
  }
});

// @desc update a outgoing
// @route PATCH /outgoing
// @access Private
const updateOutgoing = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;
  const {
    id,
    identifier,
    to,
    from,
    date,
    purpose,
    passportNumber,
    removeAttachment,
  } = req.body;

  const attachment = req.file;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const outgoing = await Outgoing.findById(id).exec();
  if (!outgoing) {
    return res.status(404).json({ message: "Outgoing not found" });
  }

  // Update fields
  outgoing.identifier = identifier ?? outgoing.identifier;
  outgoing.to = to ?? outgoing.to;
  outgoing.from = from ?? outgoing.from;
  outgoing.date = date ?? outgoing.date;
  outgoing.purpose = purpose ?? outgoing.purpose;
  outgoing.passportNumber = passportNumber ?? outgoing.passportNumber;
  outgoing.updatedAt = new Date();

  if (attachment) {
    const s3Key = `${outgoing.identifier}.pdf`;
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: attachment.buffer,
      ContentType: attachment.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}?v=${Date.now()}`;
    outgoing.attachment = s3Url;
  } else if (removeAttachment === "true") {
    console.log("Removing attachment URL as requested");
    outgoing.attachment = null;
  }

  const updatedOutgoing = await outgoing.save();

  res.json({
    message: `Outgoing with ID ${updatedOutgoing.identifier} updated`,
    outgoing: updatedOutgoing,
  });
});

// @desc delete a outgoing
// @route DELETE /outgoing
// @access Private
const deleteOutgoing = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "outgoing ID Required" });
  }

  // Does the outgoing exist to delete?
  const outgoing = await Outgoing.findById(id).exec();
  if (!outgoing) {
    return res.status(400).json({ message: "outgoing not found" });
  }

  const ID = outgoing.identifier;
  const result = await outgoing.deleteOne();

  const reply = `outgoing with ID ${ID} deleted`;

  res.json(reply);
});

module.exports = {
  getAllOutgoings,
  createNewOutgoing,
  updateOutgoing,
  deleteOutgoing,
  getOutgoingById,
};
