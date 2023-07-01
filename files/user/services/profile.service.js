const { default: mongoose } = require("mongoose")
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
const {
  ProfileFailure,
  ProfileSuccess,
} = require("../messages/profile.messages")

class ProfileService {
  static async profileImage(payload, locals) {
    const { image } = payload
    const updateUser = await UserRepository.updateUserProfile(
      { _id: locals._id },
      {
        profileImage: image,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.FETCH }

    return { return: true, msg: ProfileSuccess.UPDATE }
  }
  static async galleryService(payload, locals) {
    const { image } = payload

    const updateUser = await UserRepository.updateUserDetails(locals._id, {
      gallery: image,
    })

    if (!updateUser) return { success: false, msg: UserFailure.FETCH }

    return { return: true, msg: ProfileSuccess.UPDATE }
  }

  static async getUsersService(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "User"
    )

    if (error) return { success: false, msg: error }

    let extra = { accountType: "CityBuilder" }

    const user = await UserRepository.findAllUsersParams(
      extra,
      limit,
      skip,
      sort
    )

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: user }
  }

  static async searchUser(payload) {
    const { search } = payload

    const query = {
      $or: [
        { profession: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ],
    }

    const user = await UserRepository.findAllUsersParams(query)

    if (!user) return { success: false, msg: UserFailure.SEARCH_ERROR }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
      length: `${user.length} Services`,
    }
  }

  static async userGalleryService(locals) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: user.gallery }
  }

  static async UpdateUserService(body, locals) {
    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const updateUser = await UserRepository.updateUserProfile(
      { _id: locals._id },
      {
        ...body,
      }
    )

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async changePasswordService(body, locals) {
    const { currentPassword, newPassword, phoneNumber } = body

    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
      phoneNumber,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const isPassword = await verifyPassword(currentPassword, user.password)

    if (!isPassword) return { success: false, msg: UserFailure.UPDATE }

    user.password = await hashPassword(newPassword)
    const updateUser = await user.save()

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }
}

module.exports = { ProfileService }
