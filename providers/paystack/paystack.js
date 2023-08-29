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

    const { updatedExisting } =
      await TransactionRepository.updateTransactionDetails(
        { reference: payload.reference },
        { status: responseStatus, metaData: JSON.stringify(payload) }
      )

    if (!updatedExisting)
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

  async verifyProviderPayment(reference) {
    const { data: response } = await this.paymentRequestHandler({
      method: "GET",
      url: `/transaction/verify/${reference}`,
    })

    if (response.status && response.message == "Verification successful") {
      return this.verifyCardPayment(response)
    }

    return { success: false, msg: response.message }
  }
}

module.exports = { PaystackPaymentService }
