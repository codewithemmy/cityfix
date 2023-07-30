const { BAD_REQUEST, SUCCESS } = require("../../constants/statusCode")
const { responseHandler } = require("../../core/response")
const { manageAsyncOps } = require("../../utils")
const { CustomError } = require("../../utils/errors")
const { CampaignService } = require("./campaign.service")

const createCampaignController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    CampaignService.createCampaignService(req.body, res.locals.jwt)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

const getCampaignController = async (req, res, next) => {
  const [error, data] = await manageAsyncOps(
    CampaignService.getCampaignService(req.query)
  )

  if (error) return next(error)

  if (!data.success) return next(new CustomError(data.msg, BAD_REQUEST, data))

  return responseHandler(res, SUCCESS, data)
}

module.exports = { createCampaignController, getCampaignController }
