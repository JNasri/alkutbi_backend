const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    en_name: {
      type: String,
    },
    ar_name: {
      type: String,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    method: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Audit", auditSchema);
