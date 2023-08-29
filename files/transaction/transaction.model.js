const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      refPath: "userType",
    },
    amount: {
      type: Number,
      required: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["paystack", "bank"],
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    bankName: String,
    metaData: String,
  },
  { timestamps: true }
)

const transaction = mongoose.model(
  "Transaction",
  TransactionSchema,
  "transaction"
)

module.exports = { Transaction: transaction }
