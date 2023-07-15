const adminRoute = require("express").Router()
const { isAuthenticated } = require("../../utils/index")
const { uploadManager } = require("../../utils/multer")
const {
  getUserController,
  searchUserController,
} = require("../user/controllers/profile.controller")
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
adminRoute.route("/user").get(getUserController)
adminRoute.route("/search").get(searchUserController)
adminRoute.route("/create-user").post(createUserController)
adminRoute.route("/disable/:id").put(disableOrEnableController)
adminRoute.route("/delete/:id").put(deleteUserController)

module.exports = adminRoute
