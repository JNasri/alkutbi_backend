const PrisonCase = require("../models/PrisonCase");
const asyncHandler = require("express-async-handler");
const generatePrisonId = require("../utils/generatePrisonId.js"); // Ensure this utility exists
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

// @desc Get all prison cases
// @route GET /prisoncases
// @access Private
const getAllPrisonCases = asyncHandler(async (req, res) => {
  const cases = await PrisonCase.find().lean();
  if (!cases?.length) return res.status(200).json([]);
  res.status(200).json(cases);
});

// @desc Get a prison case by ID
// @route GET /prisoncases/:id
// @access Private
const getPrisonCaseById = asyncHandler(async (req, res) => {
  try {
    const prisonCase = await PrisonCase.findById(req.params.id);
    if (!prisonCase) {
      return res.status(404).json({ message: "Prison case not found" });
    }
    res.json(prisonCase);
  } catch (error) {
    console.error("Error fetching prison case:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc Create a new prison case
// @route POST /prisoncases
// @access Private
const createPrisonCase = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;

  const {
    name,
    sex,
    nationality,
    passportNumber,
    borderNumber,
    visaNumber,
    agent,
    dateOfArrest,
    prisonOrStation,
    comment,
    status,
    timeline
  } = req.body;

  if (!name || !sex || !nationality) {
    return res.status(400).json({ message: "Name, Sex, and Nationality are required" });
  }

  const newId = await generatePrisonId();

  // Handle file attachments
  const attachments = {};
  if (req.files) {
    for (const field of ["passportAttachment", "visaAttachment"]) {
      if (req.files[field]) {
        const file = req.files[field][0];
        const s3Key = `${newId}_${field}.pdf`;
        const uploadParams = {
          Bucket: bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        };
        await s3.send(new PutObjectCommand(uploadParams));
        attachments[field] = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      }
    }
  }

// Parse timeline safely
let TL = [];
if (req.body.timeline) {
  try {
    TL = JSON.parse(req.body.timeline);
  } catch (err) {
    return res.status(400).json({ message: "Invalid timeline format." });
  }
}

  const prisonCase = await PrisonCase.create({
    identifier: newId,
    name,
    sex,
    nationality,
    passportNumber,
    borderNumber,
    visaNumber,
    agent,
    dateOfArrest,
    prisonOrStation,
    comment,
    status,
    ...attachments,
    timeline: TL,
  });

  if (prisonCase) {
    res.status(201).json({
      message: `Prison case with ID ${newId} created successfully!`,
      case: prisonCase,
    });
  } else {
    res.status(400).json({ message: "Invalid prison case data received" });
  }
});

// @desc Update a prison case
// @route PATCH /prisoncases
// @access Private
const updatePrisonCase = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;

  const {
    id,
    identifier,
    name,
    sex,
    nationality,
    passportNumber,
    borderNumber,
    visaNumber,
    agent,
    dateOfArrest,
    prisonOrStation,
    comment,
    status,
    timeline, // 👈 full timeline array from frontend
  } = req.body;

  if (!id) return res.status(400).json({ message: "ID is required" });

  const prisonCase = await PrisonCase.findById(id);
  if (!prisonCase) return res.status(404).json({ message: "Prison case not found" });

  // Parse timeline safely
  let TL = [];
    if (req.body.timeline) {
      try {
        TL = JSON.parse(req.body.timeline);
      } catch (err) {
        return res.status(400).json({ message: "Invalid timeline format." });
      }
    }

  // Update fields
  prisonCase.identifier = identifier ?? prisonCase.identifier;
  prisonCase.name = name ?? prisonCase.name;
  prisonCase.sex = sex ?? prisonCase.sex;
  prisonCase.nationality = nationality ?? prisonCase.nationality;
  prisonCase.passportNumber = passportNumber ?? prisonCase.passportNumber;
  prisonCase.borderNumber = borderNumber ?? prisonCase.borderNumber;
  prisonCase.visaNumber = visaNumber ?? prisonCase.visaNumber;
  prisonCase.agent = agent ?? prisonCase.agent;
  prisonCase.dateOfArrest = dateOfArrest ?? prisonCase.dateOfArrest;
  prisonCase.prisonOrStation = prisonOrStation ?? prisonCase.prisonOrStation;
  prisonCase.comment = comment ?? prisonCase.comment;
  prisonCase.status = status ?? prisonCase.status;
  prisonCase.updatedAt = new Date();
  prisonCase.timeline = TL;

  // Handle file uploads
  if (req.files) {
    for (const field of ["passportAttachment", "visaAttachment"]) {
      if (req.files[field]) {
        const file = req.files[field][0];
        const s3Key = `${prisonCase.identifier}_${field}.pdf`;
        const uploadParams = {
          Bucket: bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        };
        await s3.send(new PutObjectCommand(uploadParams));
        prisonCase[field] = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}?v=${Date.now()}`;
      }
    }
  }

  const updatedCase = await prisonCase.save();
  res.json({
    message: `Prison case with ID ${updatedCase.identifier} updated`,
    case: updatedCase,
  });
});


// @desc Delete a prison case
// @route DELETE /prisoncases
// @access Private
const deletePrisonCase = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  const prisonCase = await PrisonCase.findById(id);
  if (!prisonCase) return res.status(404).json({ message: "Prison case not found" });

  const identifier = prisonCase.identifier;
  await prisonCase.deleteOne();

  res.json({ message: `Prison case with ID ${identifier} deleted` });
});

module.exports = {
  getAllPrisonCases,
  getPrisonCaseById,
  createPrisonCase,
  updatePrisonCase,
  deletePrisonCase,
};
