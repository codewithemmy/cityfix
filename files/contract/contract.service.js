const mongoose = require("mongoose")
const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { ContractRepository } = require("./contract.repository")
const { ContractFailure, ContractSuccess } = require("./contract.messages")
const { NotificationService } = require("../notification/notification.service")
const { UserRepository } = require("../user/user.repository")
const { UserFailure } = require("../user/user.messages")

class ContractService {
  static async createContractService(payload, locals) {
    const contract = await ContractRepository.create({
      ...payload,
      assignedBy: locals._id,
    })

    if (!contract) return { success: false, msg: ContractFailure.CREATE }

    return {
      success: true,
      msg: ContractSuccess.CREATE,
      contract,
    }
  }

  static async getContractService(payload) {
    const contract = await ContractRepository.searchContract(payload)

    if (!contract) return { success: false, msg: ContractFailure.FETCH }

    return {
      success: true,
      msg: ContractSuccess.FETCH,
      contract,
    }
  }

  static async startContractService(payload, locals) {
    const user = await UserRepository.findSingleUserWithParams(
      {
        _id: new mongoose.Types.ObjectId(locals._id),
      },
      {}
    )

    if (!user) return { success: false, msg: UserFailure.USER_FOUND }
    const contract = await ContractRepository.findSingleContractWithParams({
      _id: payload,
    })

    if (!contract) return { success: false, msg: ContractFailure.DECLINE }

    contract.status = "accepted"
    contract.contractStatus = "ongoing"
    const saveStatus = await contract.save()

    //send notification to user
    await NotificationService.create({
      userId: new mongoose.Types.ObjectId(locals._id),
      recipientId: new mongoose.Types.ObjectId(saveStatus.assignedBy),
      message: `Hi, ${user.firstName} has accepted your contract request, you can now send a message`,
    })

     await NotificationService.create({
       userId: new mongoose.Types.ObjectId(saveStatus.assignedBy),
       recipientId: new mongoose.Types.ObjectId(locals._id),
       message: `Hi, ${locals.name} you accepted the contract proposed by ${user.firstName}`,
     })

    return {
      success: true,
      msg: ContractSuccess.ACCEPT,
    }
  }

  static async declineContractService(payload) {
    const contract = await ContractRepository.findSingleContractWithParams({
      _id: payload,
    })

    if (!contract) return { success: false, msg: ContractFailure.DECLINE }

    contract.contractStatus = "declined"
    await contract.save()

    return {
      success: true,
      msg: ContractSuccess.DECLINE,
    }
  }

  static async endContractService(payload) {
    const contract = await ContractRepository.findSingleContractWithParams({
      _id: payload,
    })

    if (!contract) return { success: false, msg: ContractFailure.END_CONTRACT }

    contract.contractStatus = "completed"
    await contract.save()

    return {
      success: true,
      msg: ContractSuccess.DECLINE,
    }
  }
}
module.exports = { ContractService }
