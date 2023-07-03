const { BAD_REQUEST, SUCCESS } = require("../../../constants/statusCode")
const { responseHandler } = require("../../../core/response")
const { manageAsyncOps } = require("../../../utils")
const { CustomError } = require("../../../utils/errors")
const { UserService } = require("../../user/services/user.service")

const createUserController = async (req, res, next) => {
  let { firstName } = req.body

  let newBody

  if (firstName) {
    newBody = { ...req.body, accountType: "CityBuilder" }
  } else {
    newBody = req.body
  }

  const [error, data] = await manageAsyncOps(UserService.createUser(newBody))

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const userLoginController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(UserService.userLogin(req.body))

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getAllUserController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.getAllUserService(req.query)
  )
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const searchUser = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(UserService.searchUser(req.query))
  if (error) return next(error)
  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

const rateUserController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    UserService.rateUserService(req.body, res.locals.jwt)
  )

  if (error) return next(error)
  if (!data.success) return next(new CustomError(data.msg, 400, data))

  return responseHandler(res, 200, data)
}

module.exports = {
  createUserController,
  userLoginController,
  getAllUserController,
  searchUser,
  rateUserController,
}
