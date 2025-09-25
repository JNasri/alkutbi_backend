const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    employeeName: { type: String, default: null },
    department: { type: String, default: null },
    addedinJisr: { type: Boolean, default: false },
    handoverDate: { type: String, default: null },
    comment: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // 👈 THIS is crucial
  }
);

module.exports = mongoose.model("Asset", assetSchema);
