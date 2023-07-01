const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    image: String,
    accountType: {
      type: String,
      enum: ["superAdmin"],
      default: "superAdmin",
    },
  },
  { timestamps: true }
)

const admin = mongoose.model("Admin", adminSchema, "admin")

module.exports = { Admin: admin }
