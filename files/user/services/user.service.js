const mongoose = require("mongoose")
const {
  hashPassword,
  tokenHandler,
  verifyPassword,
  queryConstructor,
  sanitizePhoneNumber,
  generateOtp,
} = require("../../../utils")
const createHash = require("../../../utils/createHash")
const { UserSuccess, UserFailure } = require("../user.messages")
const { UserRepository } = require("../user.repository")
const { LIMIT, SKIP, SORT } = require("../../../constants")
const { sendMailNotification } = require("../../../utils/email")

class UserService {
  static async createUser(payload) {
    const { name, email, phoneNumber } = payload
    const validPhone = sanitizePhoneNumber(payload.phoneNumber)

    const userExist = await UserRepository.validateUser({
      $or: [{ phoneNumber: validPhone.phone }, { email: payload.email }],
    })

    if (userExist) return { SUCCESS: false, msg: UserFailure.USER_EXIST }

    const { otp, expiry } = generateOtp()

    //hash password
    const user = await UserRepository.create({
      ...payload,
      phoneNumber: validPhone.phone,
      verificationOtp: otp,
      password: await hashPassword(payload.password),
    })

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    /** once the created send otp mail for verification, if accountType is citybuilder send otp to phone number*/
    const substitutional_parameters = {
      name: name,
      emailOtp: user.verificationOtp,
    }

    await sendMailNotification(
      email,
      "Sign-Up",
      substitutional_parameters,
      "VERIFICATION"
    )

    // await onRequestOTP(otp, validPhone.phone)

    return {
      success: true,
      msg: UserSuccess.CREATE,
      otp: otp,
    }
  }

  static async userLogin(payload) {
    const { email, phoneNumber, password } = payload

    const userProfile = await UserRepository.findSingleUserWithParams({
      $or: [{ phoneNumber: phoneNumber }, { email: email }],
    })

    if (!userProfile) return { success: false, msg: UserFailure.USER_EXIST }

    if (userProfile.isVerified !== true)
      return { success: false, msg: UserFailure.VERIFIED }

    //confirm if user has been deleted
    if (userProfile.isDelete)
      return { success: false, msg: UserFailure.SOFT_DELETE }

    if (!userProfile) return { success: false, msg: UserFailure.USER_FOUND }

    const isPassword = await verifyPassword(password, userProfile.password)

    if (!isPassword) return { success: false, msg: UserFailure.FETCH }

    let token

    token = await tokenHandler({
      _id: userProfile._id,
      name: userProfile.name,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      isAdmin: false,
    })

    const user = {
      _id: userProfile._id,
      name: userProfile.name,
      firstName: userProfile.firstName,
      phoneNumber: userProfile.phoneNumber,
      email: userProfile.email,
      accountType: userProfile.accountType,
      status: userProfile.status,
      ...token,
    }

    //return result
    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }

  static async rateUserService(payload, locals) {
    const { rating, comment, userId } = payload
    const { _id } = locals

    const rateUser = await UserRepository.updateUserDetails(userId, {
      review: {
        rating: rating,
        comment: comment,
        ratedBy: new mongoose.Types.ObjectId(_id),
      },
    })

    if (!rateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async userOverviewServices() {
    const userOverview = await UserRepository.userOverview()

    if (!userOverview) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: userOverview }
  }

  static async userAnalysisService(payload) {
    if (isNaN(payload.month) || payload.month < 1 || payload.month > 12)
      return { success: false, msg: `Incorrect Month or Number passed` }

    const analysis = await UserRepository.userAnalysis(payload.month)

    if (!analysis) return { SUCCESS: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: analysis }
  }
}
module.exports = { UserService }
