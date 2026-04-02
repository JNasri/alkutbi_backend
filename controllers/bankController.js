const Bank = require("../models/Bank");
const asyncHandler = require("express-async-handler");

// @desc    Get all banks
// @route   GET /banks
// @access  Private
const getAllBanks = asyncHandler(async (req, res) => {
  const banks = await Bank.find().lean().sort({ name: 1 });
  res.status(200).json(banks);
});

// @desc    Create a new bank
// @route   POST /banks
// @access  Private (Admin, Finance_Admin)
const createBank = asyncHandler(async (req, res) => {
  const { name, ibanNumber } = req.body;

  if (!name || !ibanNumber) {
    return res.status(400).json({ message: "Bank name and IBAN number are required" });
  }

  const duplicate = await Bank.findOne({ name }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "A bank with this name already exists" });
  }

  const bank = await Bank.create({ name, ibanNumber });

  if (bank) {
    return res.status(201).json({ message: `Bank "${name}" created successfully`, bank });
  } else {
    return res.status(400).json({ message: "Invalid bank data received" });
  }
});

// @desc    Update a bank
// @route   PATCH /banks
// @access  Private (Admin, Finance_Admin)
const updateBank = asyncHandler(async (req, res) => {
  const { id, name, ibanNumber } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Bank ID is required" });
  }

  const bank = await Bank.findById(id).exec();
  if (!bank) {
    return res.status(404).json({ message: "Bank not found" });
  }

  if (name && name !== bank.name) {
    const duplicate = await Bank.findOne({ name }).lean().exec();
    if (duplicate) {
      return res.status(409).json({ message: "A bank with this name already exists" });
    }
    bank.name = name;
  }

  if (ibanNumber !== undefined) bank.ibanNumber = ibanNumber;

  const updatedBank = await bank.save();
  res.json({ message: `Bank "${updatedBank.name}" updated`, bank: updatedBank });
});

// @desc    Delete a bank
// @route   DELETE /banks
// @access  Private (Admin, Finance_Admin)
const deleteBank = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Bank ID is required" });
  }

  const bank = await Bank.findById(id).exec();
  if (!bank) {
    return res.status(404).json({ message: "Bank not found" });
  }

  const name = bank.name;
  await bank.deleteOne();

  res.json({ message: `Bank "${name}" deleted` });
});

module.exports = {
  getAllBanks,
  createBank,
  updateBank,
  deleteBank,
};
