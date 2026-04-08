const CollectionOrder = require("../models/CollectionOrder");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { uploadToS3 } = require("../config/uploadToS3");
const { getS3SignedUrl } = require("../config/getSignedUrl");
const MAIN_BUCKET = process.env.S3_BUCKET_NAME;
const generateCollectionOrderId = require("../utils/generateCollectionOrderId");
const duplicateCheck = require("../utils/duplicateCheck");
const collectionOrderDuplicateConfig = require("../config/checkDuplicateCollection");

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
    item,
    receivingBankName,
    receivingIbanNumber,
    collectedFrom,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
    notes,
    ignoreDuplicate,
  } = req.body;

  // Handle file upload to S3 if files exist
  let receiptUrl = "";
  let orderPrintUrl = "";

  if (req.files) {
    if (req.files.receipt && req.files.receipt[0]) {
      receiptUrl = await uploadToS3(req.files.receipt[0]);
    }
    if (req.files.orderPrint && req.files.orderPrint[0]) {
      orderPrintUrl = await uploadToS3(req.files.orderPrint[0]);
    }
  }



  // Confirm data - only status and dates are required at this point
  if (!status || !dayName || !dateHijri || !dateAD) {
    return res.status(400).json({ message: "Status, day name, dates, and collecting ID are required" });
  }

  // Check for duplicate data on the same day if not ignored
  if (ignoreDuplicate !== "true" && ignoreDuplicate !== true) {
    const duplicates = await duplicateCheck(CollectionOrder, {
      status,
      dayName,
      dateHijri,
      dateAD,
      collectMethod,
      voucherNumber,
      item,
      receivingBankName,
      collectedFrom,
      totalAmount,
      totalAmountText,
      deductedFrom,
      addedTo,
      notes,
    }, collectionOrderDuplicateConfig);

    if (duplicates.length > 0) {
      return res.status(409).json({
        duplicates: duplicates
      });
    }
  }

  // Auto-generate collectingId if not provided (after duplicate check to avoid wasting IDs)
  if (!collectingId) {
    collectingId = await generateCollectionOrderId(dateAD);
  }

  // Double check uniqueness for collectingId
  const duplicateId = await CollectionOrder.findOne({ collectingId }).lean().exec();
  if (duplicateId) {
    return res.status(409).json({ message: "Duplicate collecting ID. Please try again." });
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
    item: item || "",
    receivingBankName: receivingBankName || "",
    receivingIbanNumber: receivingIbanNumber || "",
    collectedFrom: collectedFrom || "",
    totalAmount: totalAmount || 0,
    totalAmountText: totalAmountText || "",
    deductedFrom: deductedFrom || "",
    addedTo: addedTo || "",
    issuer: req.userId || null,
    receiptUrl: receiptUrl || "",
    orderPrintUrl: orderPrintUrl || "",
    notes: notes || "",
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
    item,
    receivingBankName,
    receivingIbanNumber,
    collectedFrom,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
    notes,
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

  // Handle file upload to S3 if files exist
  let receiptUrl = "";
  let orderPrintUrl = "";

  if (req.files) {
    if (req.files.receipt && req.files.receipt[0]) {
      receiptUrl = await uploadToS3(req.files.receipt[0]);
    }
    if (req.files.orderPrint && req.files.orderPrint[0]) {
      orderPrintUrl = await uploadToS3(req.files.orderPrint[0]);
    }
  }



  if (status) collectionOrder.status = status;
  collectionOrder.dayName = dayName;
  collectionOrder.dateHijri = dateHijri;
  collectionOrder.dateAD = dateAD;
  collectionOrder.collectingId = collectingId;
  collectionOrder.collectMethod = collectMethod;
  collectionOrder.voucherNumber = voucherNumber || "";
  collectionOrder.item = item || "";
  collectionOrder.receivingBankName = receivingBankName || "";
  collectionOrder.receivingIbanNumber = receivingIbanNumber || "";
  collectionOrder.collectedFrom = collectedFrom;
  collectionOrder.totalAmount = totalAmount;
  collectionOrder.totalAmountText = totalAmountText;
  collectionOrder.deductedFrom = deductedFrom;
  collectionOrder.addedTo = addedTo;
  collectionOrder.notes = notes || "";

  if (receiptUrl) collectionOrder.receiptUrl = receiptUrl;
  if (orderPrintUrl) collectionOrder.orderPrintUrl = orderPrintUrl;

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

// @desc Create multiple collection orders
// @route POST /collectionorders/bulk
// @access Private
const createBulkCollectionOrders = asyncHandler(async (req, res) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ message: "No collection orders provided" });
  }

  const issuer = req.userId || null;

  // Group orders by dateAD so each date gets its own sequence
  const byDate = {};
  orders.forEach((orderData) => {
    const d = orderData.dateAD;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(orderData);
  });

  // For each date group, find the last existing sequence and build IDs
  const collectionOrdersToCreate = [];
  for (const [dateAD, group] of Object.entries(byDate)) {
    const parts = dateAD.split("-");
    const datePrefix = "CO-" + parts[0].slice(-2) + parts[1] + parts[2];

    const lastOrder = await CollectionOrder.findOne({
      collectingId: { $regex: `^${datePrefix}` }
    }).sort({ collectingId: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.collectingId) {
      const lastNumberStr = lastOrder.collectingId.replace(datePrefix, "");
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    group.forEach((orderData, index) => {
      const sequence = String(nextNumber + index).padStart(3, "0");
      const collectingId = datePrefix + sequence;

      collectionOrdersToCreate.push({
        status: orderData.status || "new",
        dayName: orderData.dayName,
        dateHijri: orderData.dateHijri,
        dateAD: orderData.dateAD,
        collectingId,
        collectMethod: orderData.collectMethod || "cash",
        collectedFrom: orderData.collectedFrom || "umrah",
        totalAmount: orderData.totalAmount || 0,
        totalAmountText: orderData.totalAmountText || "",
        notes: orderData.notes || "",
        issuer,
        voucherNumber: orderData.voucherNumber || "",
        item: orderData.item || "",
        receivingBankName: orderData.receivingBankName || "",
        receivingIbanNumber: orderData.receivingIbanNumber || "",
        deductedFrom: orderData.deductedFrom || "",
        addedTo: orderData.addedTo || "",
        receiptUrl: orderData.receiptUrl || "",
        orderPrintUrl: orderData.orderPrintUrl || "",
      });
    });
  }

  const savedOrders = await CollectionOrder.insertMany(collectionOrdersToCreate);

  res.status(201).json({
    message: `${savedOrders.length} collection orders created successfully`,
  });
});

module.exports = {
  getAllCollectionOrders,
  createNewCollectionOrder,
  createBulkCollectionOrders,
  updateCollectionOrder,
  deleteCollectionOrder,
};
