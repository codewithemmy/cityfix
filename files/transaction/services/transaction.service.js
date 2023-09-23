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

    // const user = await UserRepository.fetchUser({
    //   _id: new mongoose.Types.ObjectId(userId),
    // })

    // const admin = await AdminRepository.fetchSingleAdmin({
    //   _id: new mongoose.Types.ObjectId(userId),
    //   type: "enterpriseAdmin",
    // })

    // if (!user || !admin)
    //   return { success: false, msg: TransactionFailure.INITIATE }

    // const transaction = await TransactionRepository.create({
    //   userId,
    //   userType,
    //   email,
    //   amount,
    //   paymentFor,
    //   reference: paymentDetails.data.reference,
    //   enterpriseId: user.enterpriseId,
    //   channel: "paystack",
    //   enterpriseId: enterpriseId,
    //   subscriptionId,
    //   ...extras,
    // })

    // if (!transaction._id)
    //   return { success: false, msg: TransactionFailure.INITIATE }

    return {
      success: true,
      msg: TransactionSuccess.INITIATE,
      data: {
        ...paymentDetails,
      },
    }
  }

  static async initiateWithdrawalTransaction() {}

  static async initiateLoanPayments(body, user) {
    const confirmUser = await UserRepository.findSingleUserWithParams(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { _id: 1, email: 1 }
    )
    if (!confirmUser) return { success: false, msg: UserFailure.FETCH }

    if (
      body.paymentFor === "loanCrediting" &&
      confirmUser.accountType === "borrower"
    )
      return { success: false, msg: TransactionFailure.INITIATE }

    if (
      body.paymentFor === "loanRepayment" &&
      confirmUser.accountType === "lender"
    )
      return { success: false, msg: TransactionFailure.INITIATE }

    let extras = {}

    if (body.loanId) extras.loanId = new mongoose.Types.ObjectId(body.loanId)
    return TransactionService.initiatePaymentTransaction({
      userType: body.userType,
      userId: user._id,
      email: user.email,
      amount: body.amount,
      paymentFor: body.paymentFor,
      extras: {
        loanId: new mongoose.Types.ObjectId(body.loanId),
      },
    })
  }

  static async initiateSubscriptionPayment(body, user) {
    // get the enterprise data
    const enterprise = await EnterpriseRepository.fetchEnterprise(
      { _id: new mongoose.Types.ObjectId(user.enterpriseId) },
      { _id: 1, email: 1 }
    )
    // if enterprise data is not found throw an error
    if (!enterprise) return { sucess: false, msg: EnterpriseFailure.FETCH }

    return TransactionService.initiatePaymentTransaction({
      userType: body.userType,
      enterpriseId: user.enterpriseId,
      email: user.email,
      amount: body.amount,
      paymentFor: body.paymentFor,
      subscriptionId: body.subscriptionId,
    })
  }

  static async verifyPaymentManually(payload) {
    await this.getConfig()
    return this.paymentProvider.verifyProviderPayment(payload.reference)
  }

  static async fetchLoanAmount(locals) {
    if (locals.adminType !== "superAdmin")
      return { SUCCESS: false, msg: FORBIDDEN }
    const loanAmount = await TransactionRepository.fetchTotalLoanAmount([
      {
        //run multiple pipelines in the same aggregate function
        $facet: {
          totalAmountLentOut: [
            {
              $lookup: {
                from: "user",
                localField: "userId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      email: 1,
                      phoneNumber: 1,
                      employmentDetails: 1,
                    },
                  },
                ],
                as: "userId",
              },
            },
            { $unwind: "$userId" },
            {
              $match: {
                paymentFor: "loanCrediting",
                status: "confirmed",
              },
            },
            {
              $group: {
                _id: "$userId._id",
                totalAmountLentOut: { $sum: "$amount" },
                doc: { $first: "$$ROOT" },
              },
            },
            {
              $project: {
                "doc._id": 0,
                "doc.amount": 0,
                "doc.status": 0,
                "doc.paymentFor": 0,
                "doc.channel": 0,
                "doc.reference": 0,
                "doc.createdAt": 0,
                "doc.updatedAt": 0,
              },
            },
          ],

          totalAmountBorrowed: [
            {
              $lookup: {
                from: "user",
                localField: "userId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      email: 1,
                      phoneNumber: 1,
                      employmentDetails: 1,
                    },
                  },
                ],
                as: "userId",
              },
            },
            { $unwind: "$userId" },
            {
              $lookup: {
                from: "loan",
                localField: "loanId",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      status: 1,
                      agreedLoanDetails: 1,
                    },
                  },
                ],
                as: "loanId",
              },
            },
            { $unwind: "$loanId" },
            {
              $match: {
                "loanId.status": "approved",
              },
            },
            {
              $group: {
                _id: "$userId._id",
                totalAmountBorrowed: {
                  $sum: "$loanId.agreedLoanDetails.amount",
                },
                doc: { $first: "$$ROOT" },
              },
            },
            {
              $project: {
                "doc._id": 0,
                "doc.amount": 0,
                "doc.status": 0,
                "doc.paymentFor": 0,
                "doc.channel": 0,
                "doc.reference": 0,
                "doc.createdAt": 0,
                "doc.updatedAt": 0,
                "doc.loanId": 0,
              },
            },
          ],
        },
      },
    ])

    //get the array with the longer length

    const { totalAmountLentOut, totalAmountBorrowed } = loanAmount
    let details

    if (totalAmountLentOut.length > totalAmountBorrowed.length) {
      details = totalAmountLentOut.map((mainItem) =>
        Object.assign(
          {},
          mainItem,
          totalAmountBorrowed.find((item) =>
            item.doc.userId._id.equals(mainItem.doc.userId._id)
          )
        )
      )
    } else {
      details = totalAmountBorrowed.map((mainItem) =>
        Object.assign(
          {},
          mainItem,
          totalAmountLentOut.find((item) =>
            item.doc.userId._id.equals(mainItem.doc.userId._id)
          )
        )
      )
    }

    return { success: true, msg: TransactionMessages.TOTAL_LOAN, data: details }
  }
}

module.exports = { TransactionService }
