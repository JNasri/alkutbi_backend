const User = require("../models/User");
const Outgoing = require("../models/Outgoing");
const Incoming = require("../models/Incoming");
const asyncHandler = require("express-async-handler");
const generateIncomingId = require("../utils/generateIncomingId.js");
const s3 = require("../config/s3");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// @desc Get all incoming
// @route GET /incoming
// @access Private
const getAllIncomings = asyncHandler(async (req, res) => {
  const incoming = await Incoming.find().lean();
  if (!incoming?.length) {
    return res.status(200).json([]); // ✅ Don't send 400
  }
  // return incoming with status 200
  res.status(200).json(incoming);
});

// @desc    Get a single incoming by ID
// @route   GET /incomings/:id
// @access  Private (or Public, based on your auth setup)
const getIncomingById = async (req, res) => {
  try {
    const incoming = await Incoming.findById(req.params.id);

    if (!incoming) {
      return res.status(404).json({ message: "Incoming not found" });
    }

    res.json(incoming);
  } catch (error) {
    console.error("Error fetching incoming:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Create new incoming
// @route POST /incoming
// @access Private
const createNewIncoming = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;
  const { to, from, date, purpose, passportNumber } = req.body;
  const attachment = req.file;

  if (!attachment) {
    return res.status(400).json({ message: "Attachment is required" });
  }

  // create the id for the incoming
  const newId = await generateIncomingId();
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

  // Create and store new incoming
  const incoming = await Incoming.create({
    identifier: newId,
    to,
    from,
    date,
    purpose,
    passportNumber,
    attachment: s3Url, // store the file URL
  });

  if (incoming) {
    res
      .status(201)
      .json({ message: `Incoming with ID ${newId} created successfully!` });
  } else {
    res.status(400).json({ message: "Invalid incoming data received" });
  }
});

// @desc update a incoming
// @route PATCH /incoming
// @access Private
const updateIncoming = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;

  // Multer parses file as req.file, form fields in req.body
  const {
    id,
    to,
    identifier,
    from,
    date,
    purpose,
    passportNumber,
    removeAttachment,
  } = req.body;

  // console.log("the new file:", req.file);
  // console.log(id);

  // Check that id exists (you may get it from req.body or req.params)
  // Since router uses PATCH /, id should come in req.body
  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  const incoming = await Incoming.findById(id);
  if (!incoming) {
    return res.status(404).json({ message: "Incoming not found" });
  }

  // Update fields if provided, fallback to existing
  incoming.identifier = identifier ?? incoming.identifier;
  incoming.to = to ?? incoming.to;
  incoming.from = from ?? incoming.from;
  incoming.date = date ?? incoming.date;
  incoming.purpose = purpose ?? incoming.purpose;
  incoming.passportNumber = passportNumber ?? incoming.passportNumber;
  incoming.updatedAt = new Date();

  const s3Key = `${incoming.identifier}.pdf`;

  if (req.file) {
    // Upload new file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(uploadParams));
    const s3Url = `https://${bucketName}.s3.${
      process.env.AWS_REGION
    }.amazonaws.com/${s3Key}?v=${Date.now()}`;
    incoming.attachment = s3Url;
  } else if (removeAttachment === "true") {
    console.log("Removing attachment URL as requested");
    // Remove attachment URL if flag sent
    incoming.attachment = null;
  }
  // else keep existing attachment as is

  const updatedIncoming = await incoming.save();

  res.json({
    message: `Incoming with ID ${updatedIncoming.identifier} updated`,
    incoming: updatedIncoming,
  });
});

// @desc delete a incoming
// @route DELETE /incoming
// @access Private
const deleteIncoming = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Incoming ID Required" });
  }

  // Does the incoming exist to delete?
  const incoming = await Incoming.findById(id).exec();
  if (!incoming) {
    return res.status(400).json({ message: "Incoming not found" });
  }

  const ID = incoming.identifier;
  const result = await incoming.deleteOne();

  const reply = `Incoming with ID ${ID} deleted`;

  res.json(reply);
});

module.exports = {
  getAllIncomings,
  createNewIncoming,
  updateIncoming,
  deleteIncoming,
  getIncomingById,
};
