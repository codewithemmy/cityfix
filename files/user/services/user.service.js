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
const { onRequestOTP } = require("../../../utils/sms")

class UserService {
  static async createUser(payload) {
    const validPhone = sanitizePhoneNumber(payload.phoneNumber)

    const userExist = await UserRepository.validateUser({
      $or: [{ phoneNumber: validPhone.phone }, { email: payload.email }],
    })

    if (userExist) return { success: false, msg: UserFailure.USER_EXIST }

    const { otp, expiry } = generateOtp()

    //hash password
    const user = await UserRepository.create({
      ...payload,
      phoneNumber: validPhone.phone,
      verificationOtp: otp,
      password: await hashPassword(payload.password),
    })

    if (!user._id) return { success: false, msg: UserFailure.CREATE }

    // await onRequestOTP(otp, validPhone.phone)

    /** once the created send otp mail for verification, if role is citybuilder send otp to phone number*/

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

    if (userProfile.isVerified !== true)
      return { success: false, msg: UserFailure.VERIFIED }

    //confirm if user has been deleted
    if (userProfile.isDelete)
      return { success: false, msg: UserFailure.SOFT_DELETE }

    if (!userProfile) return { success: false, msg: UserFailure.USER_FOUND }

    const isPassword = await verifyPassword(password, userProfile.password)

    if (!isPassword) return { success: false, msg: UserFailure.FETCH }

    let token
    if (userProfile.accountType === "User") {
      token = await tokenHandler(
        userProfile.phoneNumber,
        userProfile._id,
        userProfile.accountType,
        false
      )
    } else {
      token = await tokenHandler(
        userProfile.email,
        userProfile._id,
        userProfile.accountType,
        false
      )
    }

    const user = {
      _id: userProfile._id,
      name: userProfile.name,
      phoneNumber: userProfile.phoneNumber,
      email: userProfile.email,
      ...token,
    }

    //return result
    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }
}
module.exports = { UserService }
