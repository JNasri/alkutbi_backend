const DeathCase = require("../models/DeathCase");
const asyncHandler = require("express-async-handler");
const generateDeathId = require("../utils/generateDeathId.js"); // reuse your ID util
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

// @desc Get all death cases
// @route GET /deathcases
// @access Private
const getAllDeathCases = asyncHandler(async (req, res) => {
  const cases = await DeathCase.find().lean();
  if (!cases?.length) {
    return res.status(200).json([]);
  }
  res.status(200).json(cases);
});

// @desc Get a single death case by ID
// @route GET /deathcases/:id
// @access Private
const getDeathCaseById = asyncHandler(async (req, res) => {
  try {
    const deathCase = await DeathCase.findById(req.params.id);
    if (!deathCase) {
      return res.status(404).json({ message: "Death case not found" });
    }
    res.json(deathCase);
  } catch (error) {
    console.error("Error fetching death case:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc Create a new death case
// @route POST /deathcases
// @access Private
const createDeathCase = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;
  const {
    name,
    passportNumber,
    borderNumber,
    visaNumber,
    sex,
    nationality,
    dateOfDeath,
    cityOfDeath,
    hospital,
    comment,
  } = req.body;

  // Required validation
  if (!name || !sex || !nationality) {
    return res.status(400).json({ message: "Name, Sex, and Nationality are required" });
  }

  // Generate identifier
  const newId = await generateDeathId();

  // Handle attachments (optional 10 files)
  const attachments = {};
  if (req.files) {
    for (const field of [
      "entryStamp",
      "deathCertificate",
      "passportAttachment",
      "visaAttachment",
      "consulateCertificate",
      "deathReport",
      "hospitalLetter",
      "corpseBurialPermit",
      "policeLetter",
      "otherAttachment",
    ]) {
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

  const deathCase = await DeathCase.create({
    identifier: newId,
    name,
    passportNumber,
    borderNumber,
    visaNumber,
    sex,
    nationality,
    dateOfDeath,
    cityOfDeath,
    hospital,
    comment,
    ...attachments,
  });

  if (deathCase) {
    res.status(201).json({
      message: `Death case with ID ${newId} created successfully!`,
      case: deathCase,
    });
  } else {
    res.status(400).json({ message: "Invalid death case data received" });
  }
});

// @desc Update a death case
// @route PATCH /deathcases
// @access Private
const updateDeathCase = asyncHandler(async (req, res) => {
  const bucketName = process.env.S3_BUCKET_NAME_ATTA;
  const {
    id,
    identifier,
    name,
    passportNumber,
    borderNumber,
    visaNumber,
    sex,
    nationality,
    dateOfDeath,
    cityOfDeath,
    hospital,
    comment,
  } = req.body;

  if (!id) return res.status(400).json({ message: "ID is required" });

  const deathCase = await DeathCase.findById(id);
  if (!deathCase) return res.status(404).json({ message: "Death case not found" });

  // Update fields
  deathCase.identifier = identifier ?? deathCase.identifier;
  deathCase.name = name ?? deathCase.name;
  deathCase.passportNumber = passportNumber ?? deathCase.passportNumber;
  deathCase.borderNumber = borderNumber ?? deathCase.borderNumber;
  deathCase.visaNumber = visaNumber ?? deathCase.visaNumber;
  deathCase.sex = sex ?? deathCase.sex;
  deathCase.nationality = nationality ?? deathCase.nationality;
  deathCase.dateOfDeath = dateOfDeath ?? deathCase.dateOfDeath;
  deathCase.cityOfDeath = cityOfDeath ?? deathCase.cityOfDeath;
  deathCase.hospital = hospital ?? deathCase.hospital;
  deathCase.comment = comment ?? deathCase.comment;
  deathCase.updatedAt = new Date();

  // Update attachments if new ones provided
  if (req.files) {
    for (const field of [
      "entryStamp",
      "deathCertificate",
      "passportAttachment",
      "visaAttachment",
      "consulateCertificate",
      "deathReport",
      "hospitalLetter",
      "corpseBurialPermit",
      "policeLetter",
      "otherAttachment",
    ]) {
      if (req.files[field]) {
        const file = req.files[field][0];
        const s3Key = `${deathCase.identifier}_${field}.pdf`;
        const uploadParams = {
          Bucket: bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        };
        await s3.send(new PutObjectCommand(uploadParams));
        deathCase[field] = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}?v=${Date.now()}`;
      }
    }
  }

  const updatedDeathCase = await deathCase.save();
  res.json({
    message: `Death case with ID ${updatedDeathCase.identifier} updated`,
    case: updatedDeathCase,
  });
});

// @desc Delete a death case
// @route DELETE /deathcases
// @access Private
const deleteDeathCase = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID is required" });

  const deathCase = await DeathCase.findById(id);
  if (!deathCase) return res.status(404).json({ message: "Death case not found" });

  const identifier = deathCase.identifier;
  await deathCase.deleteOne();

  res.json({ message: `Death case with ID ${identifier} deleted` });
});

module.exports = {
  getAllDeathCases,
  getDeathCaseById,
  createDeathCase,
  updateDeathCase,
  deleteDeathCase,
};
