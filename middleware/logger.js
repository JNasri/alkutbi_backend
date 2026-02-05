const Audit = require("../models/Audit");
const mongoose = require("mongoose");

// Mapping of route segments to Models
const modelMap = {
  users: "User",
  vouchers: "Voucher",
  incomings: "Incoming",
  outgoings: "Outgoing",
  deathcases: "DeathCase",
  prisoncases: "PrisonCase",
  assets: "Asset",
  purchaseorders: "PurchaseOrder",
  collectionorders: "CollectionOrder",
};

// ID fields for different models
const idFields = [
  "identifier",
  "purchasingId",
  "collectingId",
  "voucherNumber",
  "assetId",
  "username",
  "id",
  "_id",
];

// Helper to get diff between two objects
const getDiff = (oldData, newData) => {
  const diffs = [];
  const ignoreFields = [
    "_id",
    "updatedAt",
    "createdAt",
    "__v",
    "password",
    "id",
    "user",
    "issuer",
    "ticket",
    "file" // Ignore file objects, we track fileUrl instead
  ];

  // Combine keys from both to be thorough
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    if (ignoreFields.includes(key)) continue;

    let oldVal = oldData[key];
    let newVal = newData[key];

    // Standardize empty values (null, undefined, empty string) to ""
    const standardizedOld = oldVal === null || oldVal === undefined ? "" : String(oldVal).trim();
    const standardizedNew = newVal === null || newVal === undefined ? "" : String(newVal).trim();

    // Only record if they are actually different
    if (standardizedOld !== standardizedNew) {
      diffs.push(`${key}: ${standardizedOld || "Empty"} -> ${standardizedNew || "Empty"}`);
    }
  }
  return diffs.join(" | ");
};

// Helper to find ID in an object
const findId = (obj) => {
  for (const field of idFields) {
    if (obj[field]) return obj[field];
  }
  return null;
};

const logger = async (req, res, next) => {
  const username = req.user || "Guest";
  const en_name = req.en_name || "";
  const ar_name = req.ar_name || "";

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const segments = req.originalUrl.split("/").filter(Boolean);
    const resourceSegment = segments[0];
    const modelName = modelMap[resourceSegment];
    let oldData = null;

    // 1. Fetch old data if applicable
    if (["PUT", "PATCH", "DELETE"].includes(req.method) && modelName) {
      try {
        const Model = mongoose.model(modelName);
        // Try to get ID from params or body, use optional chaining for req.body
        const id = segments[1] || req.body?.id || req.body?._id;
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          oldData = await Model.findById(id).lean();
        }
      } catch (err) {
        console.error("Error fetching old data for Audit:", err);
      }
    }

    const originalJson = res.json;
    res.json = function (data) {
      res.json = originalJson;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        let action = "Unknown";
        if (req.method === "POST") action = "Add";
        else if (["PUT", "PATCH"].includes(req.method)) action = "Edit";
        else if (req.method === "DELETE") action = "Delete";

        let details = "";

        if (action === "Add") {
            // Try to find ID in response or request
            const newId = findId(data) || findId(req.body) || "New Record";
            details = `Added new ${resourceSegment}
          ID: ${newId}`;

          } else if (action === "Edit" && oldData) {
            const recordId = findId(oldData) || findId(req.body) || segments[1] || "Unknown";
            const newData = (data && typeof data === 'object' && !data.message) ? data : { ...oldData, ...req.body };
            const diff = getDiff(oldData, newData);
            
            details = `Updated ${resourceSegment}
          ID: ${recordId}${diff ? `\nChanged: ${diff}` : ""}`;

          } else if (action === "Delete") {
            const deletedId = findId(oldData || {}) || segments[1] || req.body.id || "Unknown";
            details = `Deleted ${resourceSegment}
          ID: ${deletedId}`;

          } else {
            details = `Performed ${action}\non ${req.originalUrl}`;
          }

        Audit.create({
          user: username,
          en_name,
          ar_name,
          action,
          resource: resourceSegment || "System",
          details,
          method: req.method,
          url: req.originalUrl,
        }).catch((err) => console.error("Audit creation failed:", err));
      }

      return originalJson.call(this, data);
    };
  }

  next();
};

const logEvents = async (message, logName) => {
  console.log(`[File Log] ${logName}: ${message}`);
};

module.exports = { logEvents, logger };
