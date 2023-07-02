const contractRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

const {
  createContractController,
  searchContractController,
  startContractController,
} = require("./contract.controller")

contractRoute.use(isAuthenticated)

//routes
contractRoute.route("/").post(createContractController)
contractRoute.route("/").get(searchContractController)
contractRoute.route("/start").put(startContractController)

module.exports = contractRoute
