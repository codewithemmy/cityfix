const { queryConstructor } = require("../../utils")
const { LIMIT, SKIP, SORT } = require("../../constants")
const { ContractRepository } = require("./contract.repository")
const { ContractFailure, ContractSuccess } = require("./contract.messages")

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
    const contract = await ContractRepository.findSingleContractWithParams({
      $or: [
        {
          assignedBy: locals._id,
          assignedTo: payload.assignedTo,
        },
        {
          assignedTo: locals._id,
        },
      ],
    })

    if (!contract) return { success: false, msg: ContractFailure.START }

    if (locals._id === payload.assignedTo && contract.status === "waiting") {
      contract.status = "accepted"
      contract.contractStatus = "ongoing"
      await contract.save()

      return {
        success: true,
        msg: ContractSuccess.ACCEPT,
      }
    } else {
      contract.contractStatus = "waiting"
      await contract.save()

      return {
        success: true,
        msg: ContractSuccess.START,
      }
    }
  }

  static async declineContractService(payload) {
    const contract = await ContractRepository.findSingleContractWithParams({
      _id: payload,
    })

    if (!contract) return { success: false, msg: ContractFailure.DECLINE }

    contract.status = "declined"
    await contract.save()

    return {
      success: true,
      msg: ContractSuccess.DECLINE,
    }
  }
}
module.exports = { ContractService }
