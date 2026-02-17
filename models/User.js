const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    en_name: { type: String, required: true },
    ar_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    roles: [
      {
        type: String,
        default: "Spectator",
        required: true,
      },
    ],
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // 👈 THIS is crucial
  }
);

// Middleware to prevent returning the password when querying users
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", UserSchema);
