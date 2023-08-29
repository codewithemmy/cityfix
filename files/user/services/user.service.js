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
const { AdminRepository } = require("../../admin/admin.repository")
const { authMessages } = require("../../admin/messages/auth.messages")

class UserService {
  static async createUser(payload) {
    const { lastName, email, referralId } = payload
    const validPhone = sanitizePhoneNumber(payload.phoneNumber)

    const phoneExist = await UserRepository.validateUser({
      phoneNumber: validPhone.phone,
    })
    if (phoneExist) return { success: false, msg: UserFailure.PHONE_EXIST }

    const userExist = await UserRepository.validateUser({
      email: payload.email,
    })

    if (userExist) return { success: false, msg: UserFailure.EXIST }

    const { otp, expiry } = generateOtp()

    //hash password
    const user = await UserRepository.create({
      ...payload,
      phoneNumber: validPhone.phone,
      verificationOtp: otp,
      password: await hashPassword(payload.password),
    })

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    if (referralId) {
      //validate the user
      const referral = await UserRepository.findSingleUserWithParams({
        _id: referralId,
        accountType: "Marketer",
      })

      referral.referrals++
      referral.usersReferred.push(user._id)
      await referral.save()
    }

    /** once the created send otp mail for verification, if accountType is citybuilder send otp to phone number*/
    const substitutional_parameters = {
      name: lastName,
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
    const { email, phoneNumber, password, accountType } = payload

    if (email == "example@cityfixadmin.com") {
      const admin = await AdminRepository.fetchAdmin({
        email: email,
      })

      if (!admin) {
        return {
          success: false,
          msg: authMessages.LOGIN_ERROR,
        }
      }

      const passwordCheck = await verifyPassword(password, admin.password)

      if (!passwordCheck) {
        return { success: false, msg: authMessages.LOGIN_ERROR }
      }

      const adminToken = await tokenHandler({
        _id: admin._id,
        email: admin.email,
        accountType: admin.accountType,
        isAdmin: true,
      })

      const adminProfile = {
        _id: admin._id,
        email: admin.email,
        accountType: admin.accountType,
        ...adminToken,
      }

      // admin.password = undefined
      return {
        success: true,
        msg: authMessages.ADMIN_FOUND,
        data: adminProfile,
      }
    }

    //return result
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

    if (!isPassword) return { success: false, msg: UserFailure.PASSWORD }

    userProfile.accountType = accountType
    const profile = await userProfile.save()

    let token

    token = await tokenHandler({
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      isAdmin: false,
    })

    const user = {
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      accountType: profile.accountType,
      status: profile.status,
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
