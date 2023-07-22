const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    password: { type: String },
    profileImage: { type: String },
    gallery: [
      {
        type: String,
      },
    ],
    accountType: {
      type: String,
      required: true,
      enum: ["User", "CityBuilder", "Admin", "Marketer"],
      default: "User",
    },
    yearsOfExperience: { type: Number },
    aboutYourself: { type: String },
    profession: { type: String },
    nearestBusStop: { type: String },
    localGovernment: { type: String },
    state: { type: String },
    clients: [{ type: String }],
    completedContract: { type: Number, default: 0 },
    ninDriverLicense: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "InActive", "Disabled"],
      default: "Active",
    },
    disable: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordToken: {
      type: String,
    },
    verificationOtp: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    verified: { type: Date, default: Date.now() },
  },
  { timestamps: true }
)

const user = mongoose.model("User", userSchema, "user")

module.exports = { User: user }
