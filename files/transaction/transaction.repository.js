const { Transaction } = require("./transaction.model")

class TransactionRepository {
  static async create(transactionPayload) {
    return Transaction.create({ ...transactionPayload })
  }

  static async fetchOne(payload) {
    return Transaction.findOne({ ...payload })
  }

  static async fetch(payload, select) {
    return Transaction.find({ ...payload }).select(select)
  }

  static async updateTransactionDetails(transactionPayload, update) {
    const { lastErrorObject: response } = await Transaction.findOneAndUpdate(
      {
        ...transactionPayload,
      },
      { ...update },
      { rawResult: true } //returns details about the update
    )

    return response
  }
}

module.exports = { TransactionRepository }
