const PurchaseOrder = require("../models/PurchaseOrder");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { uploadToS3 } = require("../config/uploadToS3");
const { getS3SignedUrl } = require("../config/getSignedUrl");
const MAIN_BUCKET = process.env.S3_BUCKET_NAME;
const generatePurchaseOrderId = require("../utils/generatePurchaseOrderId");
const duplicateCheck = require("../utils/duplicateCheck");
const purchaseOrderDuplicateConfig = require("../config/checkDuplicatePurchase");

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
    return res.status(400).json({ message: "Status, day name, dates, and purchasing ID are required" });
  }

  // Check for duplicate data on the same day if not ignored
  if (ignoreDuplicate !== "true" && ignoreDuplicate !== true) {
    const duplicates = await duplicateCheck(PurchaseOrder, {
      status,
      dayName,
      dateHijri,
      dateAD,
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
      notes,
    }, purchaseOrderDuplicateConfig);

    if (duplicates.length > 0) {
      return res.status(409).json({
        duplicates: duplicates
      });
    }
  }

  // Auto-generate purchasingId if not provided (after duplicate check to avoid wasting IDs)
  if (!purchasingId) {
    purchasingId = await generatePurchaseOrderId(dateAD);
  }

  // Double check uniqueness for purchasingId
  const duplicateId = await PurchaseOrder.findOne({ purchasingId }).lean().exec();
  if (duplicateId) {
    return res.status(409).json({ message: "Duplicate purchasing ID. Please try again." });
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
    receiptUrl: receiptUrl || "",
    orderPrintUrl: orderPrintUrl || "",
    notes: notes || "",
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
    notes,
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
  purchaseOrder.notes = notes || "";

  if (receiptUrl) purchaseOrder.receiptUrl = receiptUrl;
  if (orderPrintUrl) purchaseOrder.orderPrintUrl = orderPrintUrl;

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
// @desc Create multiple purchase orders
// @route POST /purchaseorders/bulk
// @access Private
const createBulkPurchaseOrders = asyncHandler(async (req, res) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ message: "No purchase orders provided" });
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
  const purchaseOrdersToCreate = [];
  for (const [dateAD, group] of Object.entries(byDate)) {
    const parts = dateAD.split("-");
    const datePrefix = "PO-" + parts[0].slice(-2) + parts[1] + parts[2];

    const lastOrder = await PurchaseOrder.findOne({
      purchasingId: { $regex: `^${datePrefix}` }
    }).sort({ purchasingId: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.purchasingId) {
      const lastNumberStr = lastOrder.purchasingId.replace(datePrefix, "");
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    group.forEach((orderData, index) => {
      const sequence = String(nextNumber + index).padStart(3, "0");
      const purchasingId = datePrefix + sequence;

      purchaseOrdersToCreate.push({
        status: orderData.status || "new",
        dayName: orderData.dayName,
        dateHijri: orderData.dateHijri,
        dateAD: orderData.dateAD,
        purchasingId,
        paymentMethod: orderData.paymentMethod || "cash",
        transactionType: orderData.transactionType || "expenses",
        item: orderData.item || "",
        totalAmount: orderData.totalAmount || 0,
        totalAmountText: orderData.totalAmountText || "",
        notes: orderData.notes || "",
        issuer,
        bankName: orderData.bankName || "",
        ibanNumber: orderData.ibanNumber || "",
        bankNameFrom: orderData.bankNameFrom || "",
        ibanNumberFrom: orderData.ibanNumberFrom || "",
        bankNameTo: orderData.bankNameTo || "",
        ibanNumberTo: orderData.ibanNumberTo || "",
        managementName: orderData.managementName || "",
        supplier: orderData.supplier || "",
        deductedFrom: orderData.deductedFrom || "",
        addedTo: orderData.addedTo || "",
        receiptUrl: orderData.receiptUrl || "",
        orderPrintUrl: orderData.orderPrintUrl || "",
      });
    });
  }

  const savedOrders = await PurchaseOrder.insertMany(purchaseOrdersToCreate);

  res.status(201).json({
    message: `${savedOrders.length} purchase orders created successfully`,
  });
});

module.exports = {
  getAllPurchaseOrders,
  createNewPurchaseOrder,
  createBulkPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
