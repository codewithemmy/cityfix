const mongoose = require("mongoose")

const textSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["Admin", "User"],
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      refPath: "sender",
    },
    recipient: {
      type: String,
      enum: ["Admin", "User"],
    },
    recipientId: {
      type: mongoose.Types.ObjectId,
      refPath: "recipient",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversations",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    image: String,
  },
  { timestamps: true }
)

const text = mongoose.model("Text", textSchema, "text")

module.exports = { Text: text }
