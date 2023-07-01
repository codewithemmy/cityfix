const { User } = require("./user.model")
const mongoose = require("mongoose")

class UserRepository {
  static async create(payload) {
    return User.create(payload)
  }

  static async findUserWithParams(userPayload, select) {
    return User.find({ ...userPayload }).select(select)
  }

  static async findSingleUserWithParams(userPayload, select) {
    return User.findOne({ ...userPayload }).select(select)
  }

  static async validateUser(userPayload) {
    return User.exists({ ...userPayload })
  }

  static async findAllUsersParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const user = await User.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }

  static async updateUserDetails(id, params) {
    return User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateUserProfile(payload, params) {
    console.log(params)

    return User.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async countsByStatus(query) {
    const userCount = await User.countDocuments().where({ ...query })
    return userCount
  }

  static async searchUser(query) {
    let { startDate, endDate, status, search, accountType } = query

    if (!search) search = ""

    let extraParams = {
      accountType,
    }

    if (status && status.length > 0) extraParams.status = status
    if (startDate && endDate)
      extraParams.date = {
        $gte: startDate,
        $lte: endDate,
      }

    const userSearch = await User.aggregate([
      {
        $addFields: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
              ],
              ...extraParams,
            },
          ],
        },
      },
    ])

    return userSearch
  }

  static async fetchUsersWithTotalLoanHistory(payload) {
    const loans = await User.aggregate([...payload])
    return loans
  }
}

module.exports = { UserRepository }
