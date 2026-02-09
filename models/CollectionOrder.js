const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const collectionOrderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["new", "authorized", "finalized"],
      default: "new",
    },
    dayName: {
      type: String,
      required: true,
    },
    dateHijri: {
      type: String,
      required: true,
    },
    dateAD: {
      type: String,
      required: true,
    },
    collectingId: {
      type: String,
      required: true,
      unique: true,
    },
    collectMethod: {
      type: String,
      required: false,
      enum: ["cash", "bank_transfer", ""],
      default: "",
    },
    voucherNumber: {
      type: String,
      default: "",
    },
    receivingBankName: {
      type: String,
      default: "",
    },
    collectedFrom: {
      type: String,
      required: false,
      default: "",
    },
    totalAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    totalAmountText: {
      type: String,
      required: false,
      default: "",
    },
    deductedFrom: {
      type: String,
      required: false,
      default: "",
    },
    addedTo: {
      type: String,
      required: false,
      default: "",
    },
    issuer: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    fileUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

collectionOrderSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "collectionTicketNums",
  start_seq: 1,
});

module.exports = mongoose.model("CollectionOrder", collectionOrderSchema);
