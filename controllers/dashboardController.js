const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Incoming = require("../models/Incoming");
const Outgoing = require("../models/Outgoing");
const DeathCase = require("../models/DeathCase");
const PrisonCase = require("../models/PrisonCase");
const Asset = require("../models/Asset");
const PurchaseOrder = require("../models/PurchaseOrder");
const CollectionOrder = require("../models/CollectionOrder");
const Audit = require("../models/Audit");

// @desc Get comprehensive dashboard statistics
// @route GET /dashboard/summary
// @access Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  // Execute all count and aggregation queries in parallel for maximum performance
  const [
    usersCount,
    incomingsCount,
    outgoingsCount,
    deathcasesCount,
    prisoncasesCount,
    assetsCount,
    logsCount,
    purchaseStats,
    collectionStats
  ] = await Promise.all([
    User.countDocuments(),
    Incoming.countDocuments(),
    Outgoing.countDocuments(),
    DeathCase.countDocuments(),
    PrisonCase.countDocuments(),
    Asset.countDocuments(),
    Audit.countDocuments(),
    PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          purchaseCashTotal: {
            $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$totalAmount", 0] }
          },
          purchaseNonCashTotal: {
            $sum: { $cond: [{ $in: ["$paymentMethod", ["visa", "bank_transfer", "sadad"]] }, "$totalAmount", 0] }
          },
          totalPurchaseAmountWithoutVisa: {
            $sum: { $cond: [{ $ne: ["$paymentMethod", "visa"] }, "$totalAmount", 0] }
          }
        }
      }
    ]),
    CollectionOrder.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          collectionCashTotal: {
            $sum: { $cond: [{ $eq: ["$collectMethod", "cash"] }, "$totalAmount", 0] }
          },
          collectionBankTotal: {
            $sum: { $cond: [{ $eq: ["$collectMethod", "bank_transfer"] }, "$totalAmount", 0] }
          }
        }
      }
    ])
  ]);

  const pStats = purchaseStats[0] || {
    totalCount: 0,
    totalAmount: 0,
    purchaseCashTotal: 0,
    purchaseNonCashTotal: 0,
    totalPurchaseAmountWithoutVisa: 0
  };

  const cStats = collectionStats[0] || {
    totalCount: 0,
    totalAmount: 0,
    collectionCashTotal: 0,
    collectionBankTotal: 0
  };

  res.json({
    usersCount,
    incomingsCount,
    outgoingsCount,
    deathcasesCount,
    prisoncasesCount,
    assetsCount,
    logsCount,
    purchaseOrdersCount: pStats.totalCount,
    totalPurchaseAmount: pStats.totalAmount,
    purchaseCashTotal: pStats.purchaseCashTotal,
    purchaseNonCashTotal: pStats.purchaseNonCashTotal,
    totalPurchaseAmountWithoutVisa: pStats.totalPurchaseAmountWithoutVisa,
    collectionOrdersCount: cStats.totalCount,
    totalCollectionAmount: cStats.totalAmount,
    collectionCashTotal: cStats.collectionCashTotal,
    collectionBankTotal: cStats.collectionBankTotal,
    balance: cStats.totalAmount - pStats.totalAmount
  });
});

module.exports = {
  getDashboardSummary
};
