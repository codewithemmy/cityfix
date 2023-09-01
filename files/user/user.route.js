const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

//controller files
const {
  createUserController,
  userLoginController,
  cityBuilderController,
  rateUserController,
} = require("../user/controllers/user.controller")

//profile
const {
  profileImageController,
  galleryController,
  getUserController,
  searchUserController,
  userGalleryController,
  updateUserController,
  changePasswordController,
  deleteUserController,
  getUserProfileController,
  deleteGalleryController,
  switchUserController,
  getReferralsController,
} = require("../user/controllers/profile.controller")
const {
  createReviewController,
  getReviewController,
} = require("../review/review.controller")

//routes
userRoute.route("/").post(createUserController)
userRoute.route("/login").post(userLoginController)

userRoute.use(isAuthenticated)

//profile route
userRoute
  .route("/image/upload")
  .put(uploadManager("profileImage").single("image"), profileImageController)

userRoute
  .route("/gallery")
  .put(uploadManager("galleryImage").single("image"), galleryController)

userRoute.route("/").get(getUserController)
userRoute.route("/search").get(searchUserController)
userRoute.route("/gallery").get(userGalleryController)
userRoute.route("/update").put(updateUserController)
userRoute.route("/change-password").put(changePasswordController)
userRoute.route("/delete-account").delete(deleteUserController)
userRoute.route("/review").post(createReviewController)
userRoute.route("/review").get(getReviewController)
userRoute.route("/profile").get(getUserProfileController)

//delete gallery picture
userRoute.route("/gallery").delete(deleteGalleryController)

//switch user
userRoute.route("/switch").put(switchUserController)

//get referrals
userRoute.route("/referrals").get(getReferralsController)

module.exports = userRoute
