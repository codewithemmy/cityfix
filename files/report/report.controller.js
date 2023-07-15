const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { ReportService } = require("./report.service")

const createReportController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    ReportService.createReport(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getReportController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(ReportService.getReport(req.query))

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = {
  createReportController,
  getReportController,
}
