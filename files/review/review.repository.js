const { Review } = require("./review.model")

class ReviewRepository {
  static async create(payload) {
    return Review.create(payload)
  }

  static async validateReview(payload) {
    return Review.exists({ ...payload })
  }

  static async findAllReviewParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const report = await Review.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "ratedBy", select: "name profileImage" })

    return report
  }
}

module.exports = { ReviewRepository }
