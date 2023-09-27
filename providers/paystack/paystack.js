const mongoose = require("mongoose")
const { config } = require("../../core/config")

const {
  TransactionMessages,
} = require("../../files/transaction/transaction.messages")
const {
  TransactionRepository,
} = require("../../files/transaction/transaction.repository")

const RequestHandler = require("../../utils/axios.provision")
const { providerMessages } = require("../providers.messages")
const {
  NotificationService,
} = require("../../files/notification/notification.service")

class PaystackPaymentService {
  paymentRequestHandler = RequestHandler.setup({
    baseURL: config.PAYSTACK_URL,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${config.PAYSTACK_KEY}`,
      "Accept-Encoding": "gzip,deflate,compress",
    },
  })

  checkSuccessStatus(status, gatewayResponse) {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  async verifySuccessOfPayment(payload) {
    const statusVerification = this.checkSuccessStatus(
      payload.status,
      payload.gateway_response
    )

    let responseStatus = "pending"
    if (statusVerification.success) {
      responseStatus = "confirmed"
    } else {
      responseStatus = "failed"
    }

    const transaction = await TransactionRepository.updateTransactionDetails(
      { reference: payload.reference },
      { status: responseStatus, metaData: JSON.stringify(payload) }
    )

    if (!transaction)
      return { success: false, msg: TransactionMessages.PAYMENT_FAILURE }

    return { success: statusVerification.success, msg: statusVerification.msg }
  }

  async initiatePayment(paymentPayload) {
    const { email, amount } = paymentPayload

    const paystackResponse = await this.paymentRequestHandler({
      method: "POST",
      url: "/transaction/initialize",
      data: {
        amount,
        email,
      },
    })

    if (!paystackResponse.status)
      return { success: false, msg: providerMessages.INITIATE_PAYMENT_FAILURE }

    const paystackData = paystackResponse.data.data

    const response = {
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
    }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
      data: response,
    }
  }

  async verifyPayment(payload) {
    //check success of transaction
    const { data } = payload
    const transaction = await TransactionRepository.fetchOne(
      {
        reference: data.reference,
      },
      true
    )

    if (!transaction?._id)
      return { success: false, msg: TransactionMessages.TRANSACTION_NOT_FOUND }

    if (transaction?.status != "pending")
      return { success: false, msg: TransactionMessages.DUPLICATE_TRANSACTION }

    const verifyAndUpdateTransactionRecord = await this.verifySuccessOfPayment(
      data
    )

    if (!verifyAndUpdateTransactionRecord.success) {
      await NotificationService.create({
        userId: new mongoose.Types.ObjectId(transaction.userId),
        recipientId: new mongoose.Types.ObjectId(transaction.userId),
        message: `Unconfirmed/failed payment of ${data.amount}`,
      })
      return { success: false, msg: TransactionMessages.PAYMENT_FAILURE }
    }

    //if payment is successful, create a notification for the user
    await NotificationService.create({
      userId: new mongoose.Types.ObjectId(transaction.userId),
      recipientId: new mongoose.Types.ObjectId(transaction.userId),
      message: `Successful payment of ${data.amount}`,
    })

    return { success: true, msg: TransactionMessages.PAYMENT_SUCCESS }
  }

  async verifyProviderPayment(reference) {
    const { data: response } = await this.paymentRequestHandler({
      method: "GET",
      url: `/transaction/verify/${reference}`,
    })

    if (response.status && response.message == "Verification successful") {
      return this.verifyPayment(response)
    }

    return { success: false, msg: response.message }
  }
}

module.exports = { PaystackPaymentService }
