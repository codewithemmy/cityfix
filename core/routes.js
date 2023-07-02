const userRoute = require("../files/user/user.route")
const adminRoute = require("../files/admin/admin.routes")
const authRoute = require("../files/auth/auth.route")
const contractRoute = require("../files/contract/contract.route")
const reportRoute = require("../files/report/report.route")

const routes = (app) => {
  const base_url = "/api/v1"

  app.use(`${base_url}/user`, userRoute)
  app.use(`${base_url}/admin`, adminRoute)
  app.use(`${base_url}/auth`, authRoute)
  app.use(`${base_url}/contract`, contractRoute)
  app.use(`${base_url}/report`, reportRoute)
}

module.exports = routes
