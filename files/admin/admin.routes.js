const adminRoute = require("express").Router()
const { isAuthenticated } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const {
  getUserController,
  searchUserController,
} = require("../user/controllers/profile.controller")
const { adminSignUpController, adminLogin } = require("./auth.controller")

adminRoute.route("/").post(adminSignUpController)
adminRoute.route("/login").post(adminLogin)

adminRoute.use(isAuthenticated)
adminRoute.route("/user").get(getUserController)
adminRoute.route("/search").get(searchUserController)

module.exports = adminRoute
