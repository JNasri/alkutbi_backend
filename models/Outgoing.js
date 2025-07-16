const mongoose = require("mongoose");

const outgoingSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
    },
    to: {
      type: String,
      default: null,
    },
    from: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      default: null,
    },
    purpose: {
      type: String,
      default: null,
    },
    passportNumber: {
      type: String,
      default: null,
    },
    attachment: {
      type: String,
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // 👈 THIS is crucial
  }
);

module.exports = mongoose.model("Outgoing", outgoingSchema);
