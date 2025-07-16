const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const VoucherSchema = new mongoose.Schema(
  {
    voucherStatus: {
      type: String,
      enum: ["new", "modified", "cancelled", "closed"],
      default: "new", // default value is "open"
    },
    operationNumber: { type: Number, unique: true },
    agentName: { type: String, required: true }, // Dropdown list
    nationality: { type: String, required: true }, // Dropdown list
    numberOfPax: { type: String, required: true },
    voucherNumber: { type: String, default: null }, // Optional
    groupNumber: { type: String, required: true },
    groupLeaderNumber: { type: String, default: null }, // Optional
    numberOfMovements: { type: Number, default: null }, // Defines how many movements are added
    movements: [
      {
        type: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
        date: { type: String, required: true },
        flightNumber: { type: String, default: null },
        hour: { type: String, default: null }, // use String or Date depending on your format (e.g. "14:30")
        gate: { type: String, default: null },
        bussArrivalTime: { type: String, required: true },
        transportationCompany: { type: String, required: true }, // Dropdown,
        driverName: { type: String, default: null },
        driverNumber: { type: String, default: null },
        caseTaker: { type: String, default: null },
        caseGiver: { type: String, default: null },
        notes: { type: String, default: null },
      },
    ],
    fileUrl: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // 👈 THIS is crucial
  }
);

// Auto-increment operationNumber
VoucherSchema.plugin(AutoIncrement, {
  inc_field: "operationNumber",
  start_seq: 1,
});

module.exports = mongoose.model("Voucher", VoucherSchema);
