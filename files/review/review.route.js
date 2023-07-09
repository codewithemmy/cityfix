const reportRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  createReportController,
  getReportController,
} = require("./review.controller")

reportRoute.use(isAuthenticated)

//routes
reportRoute.route("/").post(createReportController).get(getReportController)


module.exports = reportRoute
