const mongoose = require("mongoose");

const deathCaseSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passportNumber: { type: String, default: null },
    borderNumber: { type: String, default: null },
    visaNumber: { type: String, default: null },
    sex: { type: String, enum: ["M", "F"], required: true },
    nationality: { type: String, required: true }, // dropdown in frontend
    dateOfDeath: { type: String, default: null },
    cityOfDeath: { type: String, default: null },
    hospital: { type: String, default: null },

    // Attachments (10 fields)
    entryStamp: { type: String, default: null },
    deathCertificate: { type: String, default: null },
    passportAttachment: { type: String, default: null },
    visaAttachment: { type: String, default: null },
    consulateCertificate: { type: String, default: null },
    deathReport: { type: String, default: null },
    hospitalLetter: { type: String, default: null },
    corpseBurialPermit: { type: String, default: null },
    policeLetter: { type: String, default: null },
    otherAttachment: { type: String, default: null },

    // Extra field
    comment: { type: String, default: null },
    status: { type: String, default: null },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // ✅ auto handle createdAt, updatedAt
);

module.exports = mongoose.model("DeathCase", deathCaseSchema);
