const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { TaskService } = require("./task.service")

const assignTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.assignTaskService(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const searchTaskController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    TaskService.searchTaskService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}
module.exports = {
  assignTaskController,
  searchTaskController,
}
