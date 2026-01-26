const PurchaseOrder = require("../models/PurchaseOrder");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc Get all purchase orders
// @route GET /purchaseorders
// @access Private
const getAllPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await PurchaseOrder.find().populate("user", "username").lean();

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
    managementName,
    supplier,
    item,
    totalAmount,
    totalAmountText,
    deductedFrom,
    addedTo,
  } = req.body;

  // Auto-generate purchasingId if not provided
  if (!purchasingId) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Month with leading zero
    
    // Count existing orders for this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const count = await PurchaseOrder.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const orderNumber = String(count + 1).padStart(3, "0");
    purchasingId = `PO-${year}-${month}-${orderNumber}`;
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
    const validStatuses = ["new", "audited", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }

  // If payment method is bank_transfer or sadad, bank details are required
  if ((paymentMethod === "bank_transfer" || paymentMethod === "sadad") && (!bankName || !ibanNumber)) {
    return res.status(400).json({ message: "Bank name and IBAN number are required for this payment method" });
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
    managementName: managementName || "",
    supplier: supplier || "",
    item: item || "",
    totalAmount: totalAmount || 0,
    totalAmountText: totalAmountText || "",
    deductedFrom: deductedFrom || "",
    addedTo: addedTo || "",
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
    const validStatuses = ["new", "audited", "authorized", "finalized"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
  }

  // If payment method is bank_transfer or sadad, bank details are required
  if ((paymentMethod === "bank_transfer" || paymentMethod === "sadad") && (!bankName || !ibanNumber)) {
    return res.status(400).json({ message: "Bank name and IBAN number are required for this payment method" });
  }

  // Confirm purchase order exists to update
  const purchaseOrder = await PurchaseOrder.findById(id).exec();

  if (!purchaseOrder) {
    return res.status(400).json({ message: "Purchase order not found" });
  }

  if (status) purchaseOrder.status = status;
  purchaseOrder.dayName = dayName;
  purchaseOrder.dateHijri = dateHijri;
  purchaseOrder.dateAD = dateAD;
  purchaseOrder.purchasingId = purchasingId;
  purchaseOrder.paymentMethod = paymentMethod;
  purchaseOrder.bankName = bankName || "";
  purchaseOrder.ibanNumber = ibanNumber || "";
  purchaseOrder.managementName = managementName;
  purchaseOrder.supplier = supplier;
  purchaseOrder.item = item;
  purchaseOrder.totalAmount = totalAmount;
  purchaseOrder.totalAmountText = totalAmountText;
  purchaseOrder.deductedFrom = deductedFrom;
  purchaseOrder.addedTo = addedTo;

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
