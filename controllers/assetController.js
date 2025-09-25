const Asset = require("../models/Asset");
const asyncHandler = require("express-async-handler");

// @desc    Get all assets
// @route   GET /assets
// @access  Private
const getAllAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find().lean();
  if (!assets?.length) {
    return res.status(200).json([]); // ✅ Empty array instead of 400
  }
  res.status(200).json(assets);
});

// @desc    Get a single asset by ID
// @route   GET /assets/:id
// @access  Private
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);
  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }
  res.status(200).json(asset);
});

// @desc    Create a new asset
// @route   POST /assets
// @access  Private
const createAsset = asyncHandler(async (req, res) => {
  const {
    identifier,
    description,
    employeeName,
    department,
    addedinJisr,
    handoverDate,
    comment,
  } = req.body;

  // Validation
  if (!identifier) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  // Check for duplicate identifier
  const duplicate = await Asset.findOne({ identifier }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Identifier already exists" });
  }

  const asset = await Asset.create({
    identifier,
    description,
    employeeName,
    department,
    addedinJisr,
    handoverDate,
    comment,
  });

  if (asset) {
    res
      .status(201)
      .json({ message: `Asset ${identifier} created successfully!`, asset });
  } else {
    res.status(400).json({ message: "Invalid asset data received" });
  }
});

// @desc    Update an asset
// @route   PATCH /assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const {
    identifier,
    description,
    employeeName,
    department,
    addedinJisr,
    handoverDate,
    comment,
  } = req.body;

  const asset = await Asset.findById(id);
  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }

  // Update fields if provided
  asset.identifier = identifier ?? asset.identifier;
  asset.description = description ?? asset.description;
  asset.employeeName = employeeName ?? asset.employeeName;
  asset.department = department ?? asset.department;
  asset.addedinJisr = addedinJisr ?? asset.addedinJisr;
  asset.handoverDate = handoverDate ?? asset.handoverDate;
  asset.comment = comment ?? asset.comment;
  asset.updatedAt = new Date();

  const updatedAsset = await asset.save();
  res.json({
    message: `Asset ${updatedAsset.identifier} updated`,
    asset: updatedAsset,
  });
});

// @desc    Delete an asset
// @route   DELETE /assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Asset ID required" });
  }

  const asset = await Asset.findById(id).exec();
  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }

  const identifier = asset.identifier;
  await asset.deleteOne();

  res.json({ message: `Asset ${identifier} deleted` });
});

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
