const adminRoute = require("express").Router()
const { isAuthenticated } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const { getReportAnalysis } = require("../report/report.controller")
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
} = require("./admin.controller")

adminRoute.route("/").post(adminSignUpController)
adminRoute.route("/login").post(adminLogin)

adminRoute.use(isAuthenticated)

//user
adminRoute.route("/user").get(getUserController)
adminRoute.route("/search").get(searchUserController)
adminRoute.route("/create-user").post(createUserController)
adminRoute.route("/disable/:id").put(disableOrEnableController)
adminRoute.route("/delete/:id").put(deleteUserController)
adminRoute.route("/overview").get(userOverviewController)
adminRoute.route("/user-analysis").get(userAnalysisController)

//report
adminRoute.route("/report-analysis").get(getReportAnalysis)

module.exports = adminRoute
