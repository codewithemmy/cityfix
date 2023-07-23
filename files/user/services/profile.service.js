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

const { ReviewService } = require("../../review/review.service")

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

    return { success: true, msg: ProfileSuccess.UPDATE }
  }

  static async galleryService(payload, locals) {
    const { image } = payload

    const updateUser = await UserRepository.updateUserDetails(locals._id, {
      gallery: image,
    })

    if (!updateUser) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: ProfileSuccess.UPDATE }
  }

  static async getUserService(userPayload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      userPayload,
      "createdAt",
      "User"
    )
    if (error) return { success: false, msg: error }

    const allUsers = await UserRepository.findAllUsersParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (allUsers.length < 1) return { success: false, msg: UserFailure.FETCH }

    return { success: true, msg: UserSuccess.FETCH, data: allUsers }
  }

  static async searchUser(payload) {
    const { search } = payload

    const query = {
      $or: [
        { profession: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    }

    const user = await UserRepository.findAllUsersParams(query)

    if (!user) return { success: false, msg: UserFailure.SEARCH_ERROR }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
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
    const { currentPassword, newPassword } = body

    const user = await UserRepository.findSingleUserWithParams({
      _id: locals._id,
    })

    if (!user) return { success: false, msg: UserFailure.UPDATE }

    const isPassword = await verifyPassword(currentPassword, user.password)

    if (!isPassword) return { success: false, msg: UserFailure.UPDATE }

    user.password = await hashPassword(newPassword)
    const updateUser = await user.save()

    if (!updateUser) return { success: false, msg: UserFailure.UPDATE }

    return { success: true, msg: UserSuccess.UPDATE }
  }

  static async deleteAccountService(locals) {
    const deleteAccount = await UserRepository.deleteAccount({
      _id: new mongoose.Types.ObjectId(locals),
    })

    if (!deleteAccount) return { success: false, msg: UserFailure.DELETE }

    return { success: true, msg: UserSuccess.DELETE }
  }

  static async getUserProfileService(payload) {
    const user = await this.getUserService(payload)

    if (!user) return { success: false, msg: UserFailure.FETCH }

    return {
      success: true,
      msg: UserSuccess.FETCH,
      data: user,
    }
  }
}

module.exports = { ProfileService }
