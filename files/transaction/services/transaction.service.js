const mongoose = require("mongoose")
const {
  PaystackPaymentService,
} = require("../../../providers/paystack/paystack")
const {
  TransactionFailure,
  TransactionSuccess,
  TransactionMessages,
} = require("../transaction.messages")
const { TransactionRepository } = require("../transaction.repository")
const { UserRepository } = require("../../user/user.repository")
const { UserFailure } = require("../../user/user.messages")
const { AdminRepository } = require("../../admin/admin.repository")
class TransactionService {
  static paymentProvider

  static async getConfig() {
    this.paymentProvider = new PaystackPaymentService()
  }

  static async initiatePaymentTransaction(payload) {
    const { email, amount } = payload

    await this.getConfig()
    const paymentDetails = await this.paymentProvider.initiatePayment({
      email,
      amount,
    })

    if (!paymentDetails.success)
      return { success: false, msg: TransactionFailure.INITIATE }

    const user = await UserRepository.findSingleUserWithParams({
      email,
    })

    if (!user) return { success: false, msg: TransactionFailure.INITIATE }

    const transaction = await TransactionRepository.create({
      userId: user._id,
      userType: "User",
      email,
      amount,
      reference: paymentDetails.data.reference,
      channel: "paystack",
    })

    if (!transaction._id)
      return { success: false, msg: TransactionFailure.INITIATE }

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: {
        ...paymentDetails,
      },
    }
  }

  static async initiateWithdrawalTransaction() {}

  static async verifyPaymentManually(payload) {
    await this.getConfig()
    return this.paymentProvider.verifyProviderPayment(payload.reference)
  }
}

module.exports = { TransactionService }
