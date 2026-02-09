const CollectionOrder = require("../models/CollectionOrder");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { uploadToS3 } = require("../config/uploadToS3");
const generateCollectionOrderId = require("../utils/generateCollectionOrderId");

// @desc Get all collection orders
// @route GET /collectionorders
// @access Private
const getAllCollectionOrders = asyncHandler(async (req, res) => {
  const collectionOrders = await CollectionOrder.find()
    .populate("issuer", "username ar_name")
    .lean();

  if (!collectionOrders?.length) {
    return res.status(400).json({ message: "No collection orders found" });
  }

  res.json(collectionOrders);
});

// @desc Create new collection order
// @route POST /collectionorders
// @access Private
const createNewCollectionOrder = asyncHandler(async (req, res) => {
  let {
    status,
    dayName,
    dateHijri,
    dateAD,
    collectingId,
    collectMethod,
    voucherNumber,
    receivingBankName,
    collectedFrom,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
  } = req.body;

  // Handle file upload to S3 if file exists
  let fileUrl = "";
  if (req.file) {
    fileUrl = await uploadToS3(req.file);
  }



  // Auto-generate collectingId if not provided
  if (!collectingId) {
    collectingId = await generateCollectionOrderId();
  }

  // Double check uniqueness for collectingId
  const duplicateId = await CollectionOrder.findOne({ collectingId }).lean().exec();
  if (duplicateId) {
    return res.status(409).json({ message: "Duplicate collecting ID. Please try again." });
  }

  // Confirm data - only status, dates, dayName, and collectingId are required
  if (!status || !dayName || !dateHijri || !dateAD || !collectingId) {
    return res.status(400).json({ message: "Status, day name, dates, and collecting ID are required" });
  }

  // Validate collect method if provided
  if (collectMethod) {
    const validCollectMethods = ["cash", "bank_transfer"];
    if (!validCollectMethods.includes(collectMethod)) {
      return res.status(400).json({ message: "Invalid collect method" });
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ["new", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }



  // Create and store the new collection order
  const collectionOrder = await CollectionOrder.create({
    status: status || "new",
    dayName,
    dateHijri,
    dateAD,
    collectingId,
    collectMethod: collectMethod || "",
    voucherNumber: voucherNumber || "",
    receivingBankName: receivingBankName || "",
    collectedFrom: collectedFrom || "",
    totalAmount: totalAmount || 0,
    totalAmountText: totalAmountText || "",
    deductedFrom: deductedFrom || "",
    addedTo: addedTo || "",
    issuer: req.userId || null,
    fileUrl: fileUrl || "",
  });

  if (collectionOrder) {
    return res.status(201).json({ message: "New collection order created" });
  } else {
    return res.status(400).json({ message: "Invalid collection order data received" });
  }
});

// @desc Update a collection order
// @route PATCH /collectionorders
// @access Private
const updateCollectionOrder = asyncHandler(async (req, res) => {
  const {
    id,
    status,
    dayName,
    dateHijri,
    dateAD,
    collectingId,
    collectMethod,
    voucherNumber,
    receivingBankName,
    collectedFrom,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
  } = req.body;

  // Confirm data - only status, dates, dayName, and collectingId are required
  if (
    !id ||
    !status ||
    !dayName ||
    !dateHijri ||
    !dateAD ||
    !collectingId
  ) {
    return res.status(400).json({ message: "ID, status, day name, dates, and collecting ID are required" });
  }

  // Validate collect method if provided
  if (collectMethod) {
    const validCollectMethods = ["cash", "bank_transfer"];
    if (!validCollectMethods.includes(collectMethod)) {
      return res.status(400).json({ message: "Invalid collect method" });
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ["new", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }



  // Confirm collection order exists to update
  const collectionOrder = await CollectionOrder.findById(id).exec();

  if (!collectionOrder) {
    return res.status(400).json({ message: "Collection order not found" });
  }

  // Handle file upload to S3 if file exists
  let fileUrl = "";
  if (req.file) {
    fileUrl = await uploadToS3(req.file);
  }



  if (status) collectionOrder.status = status;
  collectionOrder.dayName = dayName;
  collectionOrder.dateHijri = dateHijri;
  collectionOrder.dateAD = dateAD;
  collectionOrder.collectingId = collectingId;
  collectionOrder.collectMethod = collectMethod;
  collectionOrder.voucherNumber = voucherNumber || "";
  collectionOrder.receivingBankName = receivingBankName || "";
  collectionOrder.collectedFrom = collectedFrom;
  collectionOrder.totalAmount = totalAmount;
  collectionOrder.totalAmountText = totalAmountText;
  collectionOrder.deductedFrom = deductedFrom;
  collectionOrder.addedTo = addedTo;
  if (fileUrl) collectionOrder.fileUrl = fileUrl;

  const updatedCollectionOrder = await collectionOrder.save();

  res.json({ message: `Collection order updated` });
});

// @desc Delete a collection order
// @route DELETE /collectionorders
// @access Private
const deleteCollectionOrder = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Collection Order ID required" });
  }

  // Confirm collection order exists to delete
  const collectionOrder = await CollectionOrder.findById(id).exec();

  if (!collectionOrder) {
    return res.status(400).json({ message: "Collection order not found" });
  }

  const result = await collectionOrder.deleteOne();

  const reply = `Collection order with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllCollectionOrders,
  createNewCollectionOrder,
  updateCollectionOrder,
  deleteCollectionOrder,
};
