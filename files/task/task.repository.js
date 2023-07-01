const { Task } = require("./task.model")
const mongoose = require("mongoose")

class TaskRepository {
  static async create(payload) {
    return Task.create(payload)
  }

  static async findTaskWithParams(userPayload, select) {
    return Task.find({ ...userPayload }).select(select)
  }

  static async findSingleTaskWithParams(userPayload, select) {
    return Task.findOne({ ...userPayload }).select(select)
  }

  static async validateTask(userPayload) {
    return Task.exists({ ...userPayload })
  }

  static async findAllTasksParams(userPayload) {
    const { limit, skip, sort, ...restOfPayload } = userPayload

    const user = await User.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return user
  }

  static async updateTaskDetails(id, params) {
    return Task.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateSetTask(payload, params) {
    return Task.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async countsByStatus(query) {
    const userCount = await Task.countDocuments().where({ ...query })
    return userCount
  }

  static async searchTask(query) {
    let { status, search } = query

    if (!search) search = ""

    let extraParams = {}

    if (status) extraParams.status = status

    const taskSearch = await Task.aggregate([
      {
        $addFields: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [{ title: { $regex: search, $options: "i" } }],
              ...extraParams,
            },
          ],
        },
      },
    ])

    return taskSearch
  }
}

module.exports = { TaskRepository }
