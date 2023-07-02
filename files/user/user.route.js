const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const userRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

//controller files
const {
  createUserController,
  userLoginController,
  cityBuilderController,
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
} = require("../user/controllers/profile.controller")

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

module.exports = userRoute
