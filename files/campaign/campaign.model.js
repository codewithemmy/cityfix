const mongoose = require("mongoose")

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    campaignType: {
      type: String,
      enum: ["adverts", "blog", "newLetter", "emailSms"],
    },
    campaign: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
)

const campaign = mongoose.model("Campaign", campaignSchema, "campaign")

module.exports = { Campaign: campaign }
