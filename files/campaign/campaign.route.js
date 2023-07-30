const contractRoute = require("express").Router()
const { isAuthenticated } = require("../../utils")

const {
  createContractController,
  getContractController,
  startContractController,
  declineContractController,
  endContractController,
} = require("./contract.controller")

contractRoute.use(isAuthenticated)

//routes
// contractRoute.route("/end/:id").put(endContractController)
// contractRoute.route("/").post(createContractController)
// contractRoute.route("/start/:id").put(startContractController)
// contractRoute.route("/").get(getContractController)
// contractRoute.route("/decline/:id").put(declineContractController)

module.exports = contractRoute
