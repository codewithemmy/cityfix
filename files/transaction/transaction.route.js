const transactionRoute = require("express").Router()
const { checkSchema } = require("express-validator")
const { validate } = require("../../validations/validate")
// const {
//   initiateLoanPaymentValidation,
// } = require("../../validations/transaction/transaction.validation")

const { isAuthenticated } = require("../../utils")
const {
  paymentTransactionController,
} = require("./controller/transaction.controller")

// transactionRoute.use(isAuthenticated)

transactionRoute.route("/initiate").post(paymentTransactionController)

//routes
module.exports = transactionRoute
