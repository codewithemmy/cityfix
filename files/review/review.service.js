const { queryConstructor } = require("../../utils")
const { ReviewFailure, ReviewSuccess } = require("./review.messages")
const { ReviewRepository } = require("./review.repository")

class ReviewService {
  static async createReview(payload, locals) {
    const { userRated } = payload

    const review = await ReviewRepository.create({
      ...payload,
      userRated,
      ratedBy: locals._id,
    })

    if (!review) return { success: false, msg: ReviewFailure.CREATE }

    return { success: true, msg: ReviewSuccess.CREATE }
  }

  static async getReviewService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Review"
    )
    if (error) return { success: false, msg: ReviewFailure.FETCH }

    const reviews = await ReviewRepository.findAllReviewParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!reviews) return { success: false, msg: ReviewFailure.FETCH }

    const totalReviews = reviews.length
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / totalReviews

    return {
      success: true,
      msg: ReviewService.FETCH,
      data: { reviews, averageRating },
    }
  }
}

module.exports = { ReviewService }
