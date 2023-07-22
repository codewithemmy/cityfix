const { User } = require("./user.model")
const mongoose = require("mongoose")

class UserRepository {
  static async create(payload) {
    return await User.create(payload)
  }

  static async findUserWithParams(userPayload, select) {
    return await User.find({ ...userPayload }).select(select)
  }

  static async findSingleUserWithParams(userPayload, select) {
    const user = await User.findOne({ ...userPayload }).select(select)

    return user
  }

  static async validateUser(userPayload) {
    return User.exists({ ...userPayload })
  }

  static async findAllUsersParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const user = await User.find({ ...restOfPayload }, { password: 0 })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "review.ratedBy",
        select: "name profileImage ",
      })

    return user
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateUserProfile(payload, params) {
    return User.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }
  static async updateUserById(id, params) {
    return User.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { ...params }
    )
  }

  static async countsByStatus(query) {
    const userCount = await User.countDocuments().where({ ...query })
    return userCount
  }

  static async deleteAccount(payload) {
    const deleteAccount = await User.findOneAndDelete({
      ...payload,
    })

    return deleteAccount
  }

  static async userOverview(payload) {
    // Perform the aggregate query
    const overview = await User.aggregate([
      // Perform the $lookup to join with the "review" collection
      {
        $lookup: {
          from: "review", // The collection to join with
          localField: "_id", // The field from the "user" collection
          foreignField: "userRated", // The field from the "review" collection to match with
          as: "reviews", // The field in the result to store the joined reviews
        },
      },
      // Group the results by user fields and get the count of users and total number of reviews
      {
        $group: {
          _id: "$_id", // Group by user's _id (you can use other fields if needed)
          userCount: { $sum: 1 }, // Count the users in the group
          totalReviews: { $sum: { $size: "$reviews" } }, // Get the total number of reviews for each user
        },
      },
      // Project to include only necessary information and exclude _id
      {
        $project: {
          _id: 0,
          userCount: 1,
          totalReviews: 1,
        },
      },
      // Group again to calculate the sum of all userCount and totalReviews
      {
        $group: {
          _id: null, // Group by null to calculate the sum across all documents
          registerUsers: { $sum: "$userCount" }, // Sum all userCount
          reviews: { $sum: "$totalReviews" }, // Sum all totalReviews
        },
      },
      // Optionally, project to exclude _id and show only the sums
      {
        $project: {
          _id: 0,
          registerUsers: 1,
          reviews: 1,
        },
      },
    ])

    return overview
  }

  static async userAnalysis(month) {
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1)
    const endOfMonth = new Date(new Date().getFullYear(), month, 1)

    // Perform the aggregate query
    const analysis = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: {
            accountType: "$accountType",
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          accountType: "$_id.accountType",
          month: "$_id.month",
          count: 1,
        },
      },
    ])

    return analysis
  }
}

module.exports = { UserRepository }
