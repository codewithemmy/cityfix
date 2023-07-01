const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    otherDetails: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "complete"],
      default: "pending",
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

const task = mongoose.model("Task", userSchema, "task")

module.exports = { Task: task }
