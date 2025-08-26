const mongoose = require("mongoose");

const prisonCaseSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sex: { type: String, enum: ["M", "F"], required: true },
    nationality: { type: String, required: true }, // dropdown in frontend
    passportNumber: { type: String, default: null },
    borderNumber: { type: String, default: null },
    visaNumber: { type: String, default: null },
    agent: { type: String, default: null },
    dateOfArrest: { type: String, default: null },
    prisonOrStation: { type: String, default: null },

    // Attachments (10 fields)
    passportAttachment: { type: String, default: null },
    visaAttachment: { type: String, default: null },

    // Extra field
    comment: { type: String, default: null },
    status: { type: String, default: null },
    // NEW FIELD: Timeline as array of strings
    timeline: [{ date: String, note: String }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // ✅ auto handle createdAt, updatedAt
);

module.exports = mongoose.model("PrisonCase", prisonCaseSchema);
