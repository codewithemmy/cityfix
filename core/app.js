const { handleApplicationErrors, notFound } = require("./response")

const express = require("express")
const cors = require("cors")
const compression = require("compression")
const emailValidation = require("./emailCheck")
const routes = require("./routes")

const app = express()

const application = () => {
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(compression())
  app.use(cors())
  app.use(emailValidation)

  routes(app)
  app.get("/", (req, res) => {
    res.status(200).json({ message: "citifix is working fine" })
  })

  app.use(handleApplicationErrors) //application errors handler
  app.use(notFound)
}

module.exports = { app, application }
