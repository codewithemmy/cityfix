const {
  adminSignUpController,
  adminLogin,
} = require("../admin/admin.controller")
const { checkSchema } = require("express-validator")
const { createAdmin } = require("../../validations/admin/admin")
const { validate } = require("../../validations/validate")
const {
  verifyUserController,
  forgotPasswordController,
  resetPasswordController,
} = require("./controller/auth.controller")

const authRoute = require("express").Router()

//routes
authRoute.post("/verify", verifyUserController)
authRoute.post("/forgot-password", forgotPasswordController)
authRoute.patch("/reset-password/:id", resetPasswordController)

module.exports = authRoute
