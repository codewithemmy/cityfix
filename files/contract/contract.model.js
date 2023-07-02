const mongoose = require("mongoose")

const contractSchema = new mongoose.Schema(
  {
    contractPurpose: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "waiting"],
      default: "pending",
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

const contract = mongoose.model("Contract", contractSchema, "contract")

module.exports = { Contract: contract }
