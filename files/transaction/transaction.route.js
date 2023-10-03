const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")

const { isAuthenticated } = require("../../utils")
const {
  paymentTransactionController,
  verifyTransactionController,
} = require("./controller/transaction.controller")
const {
  createTransactionValidation,
} = require("../../validations/transaction/createTransaction.validation")

// transactionRoute.use(isAuthenticated)

transactionRoute
  .route("/initiate")
  .post(
    validate(checkSchema(createTransactionValidation)),
    paymentTransactionController
  )
  
transactionRoute.route("/verify").get(verifyTransactionController)

//routes
module.exports = transactionRoute
