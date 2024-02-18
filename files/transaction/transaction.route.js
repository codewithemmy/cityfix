const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")

const { isAuthenticated } = require("../../utils")
const {
  paymentTransactionController,
  paystackWebHook,
} = require("./controller/transaction.controller")
const {
  createTransactionValidation,
} = require("../../validations/transaction/createTransaction.validation")

transactionRoute.post("/paystack-webhook", paystackWebHook)

transactionRoute.use(isAuthenticated)

transactionRoute
  .route("/initiate")
  .post(
    validate(checkSchema(createTransactionValidation)),
    paymentTransactionController
  )

//routes
module.exports = transactionRoute
