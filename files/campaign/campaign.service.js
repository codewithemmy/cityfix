const mongoose = require("mongoose")
const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { CampaignRepository } = require("./campaign.repository")
const { CampaignFailure, CampaignSuccess } = require("./campaign.messages")

class CampaignService {
  static async createCampaignService(payload, locals) {
    const campaign = await CampaignRepository.create({
      ...payload,
      userId: locals._id,
    })

    if (!campaign) return { success: false, msg: CampaignFailure.CREATE }

    return {
      success: true,
      msg: CampaignSuccess.CREATE,
      campaign,
    }
  }

  static async getCampaignService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Campaign"
    )

    if (error) return { success: false, msg: error }

    const campaign = await CampaignRepository.findAllCampaignParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!campaign) return { success: false, msg: CampaignFailure.FETCH }

    const countCampaign = await CampaignRepository.countsByStatus()

    return {
      success: true,
      msg: CampaignSuccess.FETCH,
      campaign,
      totalCampaigns: countCampaign,
    }
  }
}
module.exports = { CampaignService }
