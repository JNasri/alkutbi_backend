const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const purchaseOrderSchema = new mongoose.Schema(
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
    purchasingId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentMethod: {
      type: String,
      required: false,
      enum: ["cash", "visa", "bank_transfer", "sadad", ""],
      default: "",
    },
    bankName: {
      type: String,
      default: "",
    },
    ibanNumber: {
      type: String,
      default: "",
    },
    bankNameFrom: {
      type: String,
      default: "",
    },
    ibanNumberFrom: {
      type: String,
      default: "",
    },
    bankNameTo: {
      type: String,
      default: "",
    },
    ibanNumberTo: {
      type: String,
      default: "",
    },
    transactionType: {
      type: String,
      required: false,
      enum: ["expenses", "receivables", "custody", "advance", ""],
      default: "",
    },
    managementName: {
      type: String,
      required: false,
      default: "",
    },
    supplier: {
      type: String,
      required: false,
      default: "",
    },
    item: {
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

purchaseOrderSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 1,
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
