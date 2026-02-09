const PurchaseOrder = require("../models/PurchaseOrder");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { uploadToS3 } = require("../config/uploadToS3");
const generatePurchaseOrderId = require("../utils/generatePurchaseOrderId");

// @desc Get all purchase orders
// @route GET /purchaseorders
// @access Private
const getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.find()
    .populate("issuer", "username ar_name")
    .lean();

  if (!purchaseOrders?.length) {
    return res.status(400).json({ message: "No purchase orders found" });
  }

  res.json(purchaseOrders);
});

// @desc Create new purchase order
// @route POST /purchaseorders
// @access Private
const createNewPurchaseOrder = asyncHandler(async (req, res) => {
  let {
    status,
    dayName,
    dateHijri,
    dateAD,
    purchasingId,
    paymentMethod,
    bankName,
    ibanNumber,
    bankNameFrom,
    ibanNumberFrom,
    bankNameTo,
    ibanNumberTo,
    transactionType,
    managementName,
    supplier,
    item,
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


  // Auto-generate purchasingId if not provided
  if (!purchasingId) {
    purchasingId = await generatePurchaseOrderId();
  }

  // Double check uniqueness for purchasingId
  const duplicateId = await PurchaseOrder.findOne({ purchasingId }).lean().exec();
  if (duplicateId) {
    return res.status(409).json({ message: "Duplicate purchasing ID. Please try again." });
  }

  // Confirm data - only status, dates, dayName, and purchasingId are required
  if (!status || !dayName || !dateHijri || !dateAD || !purchasingId) {
    return res.status(400).json({ message: "Status, day name, dates, and purchasing ID are required" });
  }

  // Validate payment method if provided
  if (paymentMethod) {
    const validPaymentMethods = ["cash", "visa", "bank_transfer", "sadad"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ["new", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }

  // Create and store the new purchase order
  const purchaseOrder = await PurchaseOrder.create({
    status: status || "new",
    dayName,
    dateHijri,
    dateAD,
    purchasingId,
    paymentMethod: paymentMethod || "",
    bankName: bankName || "",
    ibanNumber: ibanNumber || "",
    bankNameFrom: bankNameFrom || "",
    ibanNumberFrom: ibanNumberFrom || "",
    bankNameTo: bankNameTo || "",
    ibanNumberTo: ibanNumberTo || "",
    transactionType: transactionType || "",
    managementName: managementName || "",
    supplier: supplier || "",
    item: item || "",
    totalAmount: totalAmount || 0,
    totalAmountText: totalAmountText || "",
    deductedFrom: deductedFrom || "",
    addedTo: addedTo || "",
    issuer: req.userId || null,
    fileUrl: fileUrl || "",
  });

  if (purchaseOrder) {
    return res.status(201).json({ message: "New purchase order created" });
  } else {
    return res.status(400).json({ message: "Invalid purchase order data received" });
  }
});

// @desc Update a purchase order
// @route PATCH /purchaseorders
// @access Private
const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const {
    id,
    status,
    dayName,
    dateHijri,
    dateAD,
    purchasingId,
    paymentMethod,
    bankName,
    ibanNumber,
    bankNameFrom,
    ibanNumberFrom,
    bankNameTo,
    ibanNumberTo,
    transactionType,
    managementName,
    supplier,
    item,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
  } = req.body;

  // Confirm data - only status, dates, dayName, and purchasingId are required
  if (
    !id ||
    !status ||
    !dayName ||
    !dateHijri ||
    !dateAD ||
    !purchasingId
  ) {
    return res.status(400).json({ message: "ID, status, day name, dates, and purchasing ID are required" });
  }

  // Validate payment method if provided
  if (paymentMethod) {
    const validPaymentMethods = ["cash", "visa", "bank_transfer", "sadad"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ["new", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }

  // Confirm purchase order exists to update
  const purchaseOrder = await PurchaseOrder.findById(id).exec();

  if (!purchaseOrder) {
    return res.status(400).json({ message: "Purchase order not found" });
  }

  // Handle file upload to S3 if file exists
  let fileUrl = "";
  if (req.file) {
    fileUrl = await uploadToS3(req.file);
  }


  if (status) purchaseOrder.status = status;
  purchaseOrder.dayName = dayName;
  purchaseOrder.dateHijri = dateHijri;
  purchaseOrder.dateAD = dateAD;
  purchaseOrder.purchasingId = purchasingId;
  purchaseOrder.paymentMethod = paymentMethod;
  purchaseOrder.bankName = bankName || "";
  purchaseOrder.ibanNumber = ibanNumber || "";
  purchaseOrder.bankNameFrom = bankNameFrom || "";
  purchaseOrder.ibanNumberFrom = ibanNumberFrom || "";
  purchaseOrder.bankNameTo = bankNameTo || "";
  purchaseOrder.ibanNumberTo = ibanNumberTo || "";
  purchaseOrder.transactionType = transactionType || "";
  purchaseOrder.managementName = managementName;
  purchaseOrder.supplier = supplier;
  purchaseOrder.item = item;
  purchaseOrder.totalAmount = totalAmount;
  purchaseOrder.totalAmountText = totalAmountText;
  purchaseOrder.deductedFrom = deductedFrom;
  purchaseOrder.addedTo = addedTo;
  if (fileUrl) purchaseOrder.fileUrl = fileUrl;

  const updatedPurchaseOrder = await purchaseOrder.save();

  res.json({ message: `Purchase order updated` });
});

// @desc Delete a purchase order
// @route DELETE /purchaseorders
// @access Private
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Purchase Order ID required" });
  }

  // Confirm purchase order exists to delete
  const purchaseOrder = await PurchaseOrder.findById(id).exec();

  if (!purchaseOrder) {
    return res.status(400).json({ message: "Purchase order not found" });
  }

  const result = await purchaseOrder.deleteOne();

  const reply = `Purchase order with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllPurchaseOrders,
  createNewPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
