const { Contract } = require("./contract.model")
const mongoose = require("mongoose")

class ContractRepository {
  static async create(payload) {
    return Contract.create(payload)
  }

  static async findContractWithParams(payload, select) {
    return Contract.find({ ...payload }).select(select)
  }

  static async findSingleContractWithParams(payload, select) {
    return Contract.findOne({ ...payload }).select(select)
  }

  static async validateContract(payload) {
    return Contract.exists({ ...payload })
  }

  static async findAllContractsParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const contract = await Contract.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return contract
  }

  static async updateContractDetails(id, params) {
    return Contract.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $push: { ...params } } //returns details about the update
    )
  }

  static async updateSetContract(payload, params) {
    return Contract.findOneAndUpdate({ ...payload }, { $set: { ...params } })
  }

  static async countsByStatus(query) {
    const userCount = await Contract.countDocuments().where({ ...query })
    return userCount
  }

  static async searchContract(query) {
    let { userId, search, contractStatus } = query

    if (!search) search = ""

    let extraParams = {}

    if (contractStatus) extraParams.contractStatus = contractStatus
    if (userId) extraParams._id = new mongoose.Types.ObjectId(userId)

    const ContractSearch = await Contract.aggregate([
      {
        $addFields: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [{ contractPurpose: { $regex: search, $options: "i" } }],
              ...extraParams,
            },
          ],
        },
      },
    ])

    return ContractSearch
  }
}

module.exports = { ContractRepository }
