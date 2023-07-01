const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { TaskRepository } = require("./task.repository")
const { TaskFailure, TaskSuccess } = require("./task.messages")

class TaskService {
  static async assignTaskService(payload, locals) {
    const task = await TaskRepository.create({
      ...payload,
      assignedBy: locals._id,
    })

    if (!task) return { success: false, msg: TaskFailure.CREATE }

    return {
      success: true,
      msg: TaskSuccess.CREATE,
      task,
    }
  }

  static async searchTaskService(payload) {
    const task = await TaskRepository.searchTask(payload)

    if (!task) return { success: false, msg: TaskFailure.FETCH }

    return {
      success: true,
      msg: TaskSuccess.FETCH,
      task,
    }
  }
}
module.exports = { TaskService }
