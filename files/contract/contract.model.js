const mongoose = require("mongoose")

const contractSchema = new mongoose.Schema(
  {
    contractPurpose: {
      type: String,
    },
    description: {
      type: String,
    },
    contractStatus: {
      type: String,
      enum: ["pending", "ongoing", "completed", "waiting"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["accepted", "declined"],
    },
    assignedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    declineReason: String,
  },
  { timestamps: true }
)

const contract = mongoose.model("Contract", contractSchema, "contract")

module.exports = { Contract: contract }
