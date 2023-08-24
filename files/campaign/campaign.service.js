const mongoose = require("mongoose")
const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { CampaignRepository } = require("./campaign.repository")
const {
  NotificationRepository,
} = require("../notification/notification.repository")
const { CampaignFailure, CampaignSuccess } = require("./campaign.messages")
const { UserRepository } = require("../user/user.repository")

class CampaignService {
  static async createCampaignService(payload, locals) {
    const { accountType, title, campaign } = payload
    const newCampaign = await CampaignRepository.create({
      ...payload,
      userId: locals._id,
    })

    let mappedUsers

    if (accountType === "User") {
      const user = await UserRepository.findUserWithParams({
        accountType: "User",
      })
      mappedUsers = user.map((item) => {
        NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(item._id),
          title: `${title}`,
          message: `${campaign}`,
          accountType,
        })
      })
    } else if (accountType === "CityBuilder") {
      const user = await UserRepository.findUserWithParams({
        accountType: "CityBuilder",
      })
      mappedUsers = user.map((item) => {
        NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(item._id),
          title: `${title}`,
          message: `${campaign}`,
          accountType,
        })
      })
    } else if (accountType === "Marketer") {
      const user = await UserRepository.findUserWithParams({
        accountType: "Marketer",
      })
      mappedUsers = user.map((item) => {
        NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(item._id),
          title: `${title}`,
          message: `${campaign}`,
          accountType,
        })
      })
    } else {
      const user = await UserRepository.findUserWithParams()
      mappedUsers = user.map((item) => {
        NotificationRepository.createNotification({
          recipientId: new mongoose.Types.ObjectId(item._id),
          title: `${title}`,
          message: `${campaign}`,
          accountType,
        })
      })
    }
    await Promise.all(mappedUsers)

    if (!newCampaign) return { success: false, msg: CampaignFailure.CREATE }

    return {
      success: true,
      msg: CampaignSuccess.CREATE,
      newCampaign,
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
