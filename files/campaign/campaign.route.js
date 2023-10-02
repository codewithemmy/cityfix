const campaignRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const { getCampaignController } = require("./campaign.controller")

campaignRoute.route("/").get(getCampaignController)
campaignRoute.use(isAuthenticated)

//routes

module.exports = campaignRoute
