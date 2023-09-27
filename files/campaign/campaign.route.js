const campaignRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { getCampaignController } = require("./campaign.controller")

campaignRoute.use(isAuthenticated)

//routes
campaignRoute.route("/").get(getCampaignController)

module.exports = campaignRoute
