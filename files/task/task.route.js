const { uploadManager } = require("../../utils/multer")
const { checkSchema } = require("express-validator")
const taskRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")
const {
  searchTaskController,
  assignTaskController,
} = require("./task.controller")

taskRoute.use(isAuthenticated)

//routes
taskRoute.route("/").post(assignTaskController)
taskRoute.route("/").get(searchTaskController)

module.exports = taskRoute
