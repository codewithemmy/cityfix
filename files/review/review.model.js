const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    userRated: { type: mongoose.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String,
    ratedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

const review = mongoose.model("Review", reviewSchema, "review")

module.exports = { Review: review }
