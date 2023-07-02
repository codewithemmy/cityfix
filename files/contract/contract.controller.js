const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { ContractService } = require("./contract.service")

const createContractController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ContractService.createContractService(req.body, res.locals.jwt)
  )
  console.log("error", error)
  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const searchContractController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ContractService.searchContractService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const startContractController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ContractService.startContractService(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}
module.exports = {
  createContractController,
  searchContractController,
  startContractController,
}
