const Voucher = require("../models/Voucher");
const asyncHandler = require("express-async-handler");
const { uploadToS3 } = require("../config/uploadToS3");

// @desc Get all vouchers
// @route GET /vouchers
// @access Private
const getAllVouchers = asyncHandler(async (req, res) => {
  const vouchers = await Voucher.find().lean();
  if (!vouchers?.length) {
    return res.status(400).json({ message: "No vouchers found" });
  }
  res.json(vouchers);
});

// @desc Create new voucher
// @route POST /vouchers
// @access Private
const createNewVoucher = asyncHandler(async (req, res) => {
  const {
    agentName,
    nationality,
    numberOfPax,
    voucherNumber,
    groupNumber,
    groupLeaderNumber,
    numberOfMovements,
    movements,
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  // console.log(
  //   agentName,
  //   nationality,
  //   numberOfPax,
  //   groupNumber,
  //   groupLeaderNumber,
  //   numberOfMovements,
  //   movements,
  //   req.file
  // );
  const fileUrl = await uploadToS3(req.file);

  // Basic validation of required fields
  if (
    !agentName ||
    !nationality ||
    !numberOfPax ||
    !groupNumber ||
    !numberOfMovements ||
    !movements
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // prase the movements from string to object
  req.body.movements = JSON.parse(req.body.movements);

  const voucher = await Voucher.create({
    agentName,
    nationality,
    numberOfPax,
    voucherNumber: voucherNumber || null,
    groupNumber,
    groupLeaderNumber: groupLeaderNumber || null,
    numberOfMovements,
    movements: req.body.movements,
    fileUrl: fileUrl, // ✅ Save the S3 file URL here //
    createdBy: req.user?._id || null,
  });

  if (voucher) {
    res.status(201).json({ message: `New Voucher Created!` });
  } else {
    res.status(400).json({ message: "Invalid Voucher data received" });
  }
});

// @desc Update a voucher
// @route PATCH /vouchers
// @access Private
const updateVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    voucherStatus,
    agentName,
    nationality,
    numberOfPax,
    voucherNumber,
    groupNumber,
    groupLeaderNumber,
    numberOfMovements,
    movements,
  } = req.body;

  // check if req.file exists and upload to S3
  let fileUrl = null;
  if (req.file) {
    fileUrl = await uploadToS3(req.file);
  }

  // Basic validation of required fields
  if (
    !id ||
    !agentName ||
    !nationality ||
    !numberOfPax ||
    !groupNumber ||
    !numberOfMovements ||
    !movements ||
    !voucherStatus
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const voucher = await Voucher.findById(id).exec();
  if (!voucher) {
    return res.status(400).json({ message: "Voucher not found" });
  }
  voucher.voucherStatus = voucherStatus || "modified";
  voucher.agentName = agentName;
  voucher.nationality = nationality;
  voucher.numberOfPax = numberOfPax;
  voucher.voucherNumber = voucherNumber || null;
  voucher.groupNumber = groupNumber;
  voucher.groupLeaderNumber = groupLeaderNumber || null;
  voucher.numberOfMovements = numberOfMovements;
  // prase the movements from string to object
  voucher.movements = JSON.parse(req.body.movements);
  voucher.fileUrl = fileUrl || voucher.fileUrl; // Update the file URL if a new file is uploaded

  const updatedVoucher = await voucher.save();

  res.json({ message: `Voucher ${updatedVoucher.operationNumber} updated` });
});

// @desc Delete a voucher
// @route DELETE /vouchers
// @access Private
const deleteVoucher = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Voucher ID required" });
  }

  const voucher = await Voucher.findById(id).exec();
  if (!voucher) {
    return res.status(400).json({ message: "Voucher not found" });
  }

  const { operationNumber, _id } = voucher;

  const result = await voucher.deleteOne();
  const reply = `Voucher Number ${operationNumber} with ID ${_id} deleted`;
  res.json(reply);
});

// @desc Retrieve a file by filename
// @route GET /vouchers/files/:filename
// @access Private
const getVoucherById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const voucher = await Voucher.findById(id);
  if (!voucher) {
    return res.status(404).json({ message: "Voucher not found" });
  }

  res.status(200).json(voucher);
});

module.exports = {
  getAllVouchers,
  createNewVoucher,
  updateVoucher,
  deleteVoucher,
  getVoucherById,
};
