const adminRoute = require("express").Router()
const { isAuthenticated } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const { getReportAnalysis } = require("../report/report.controller")
const { reviewListController } = require("../review/review.controller")
const {
  createCampaignController,
  getCampaignController,
} = require("../campaign/campaign.controller")
const {
  getUserController,
  searchUserController,
} = require("../user/controllers/profile.controller")
const {
  userOverviewController,
  userAnalysisController,
} = require("../user/controllers/user.controller")
const {
  adminSignUpController,
  adminLogin,
  createUserController,
  disableOrEnableController,
  deleteUserController,
  fetchAdminController,
  createMarketerController,
} = require("./admin.controller")

//admin route
adminRoute.route("/").post(adminSignUpController)
adminRoute.route("/login").post(adminLogin)

adminRoute.use(isAuthenticated)

//user
adminRoute.route("/user").get(getUserController)
adminRoute.route("/disable/:id").patch(disableOrEnableController)
adminRoute.route("/search").get(searchUserController)
adminRoute.route("/create-user").post(createUserController)
adminRoute.route("/delete/:id").delete(deleteUserController)
adminRoute.route("/overview").get(userOverviewController)
adminRoute.route("/user-analysis").get(userAnalysisController)

//report
adminRoute.route("/report-analysis").get(getReportAnalysis)

//reviews
adminRoute.route("/review-list").get(reviewListController)

//campaign
adminRoute.route("/campaign").post(createCampaignController)
adminRoute.route("/campaign").get(getCampaignController)

//admin profile
adminRoute.route("/me").get(fetchAdminController)

//create marketer
adminRoute.route("/create-marketer").put(createMarketerController)

module.exports = adminRoute
