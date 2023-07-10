const { Text } = require("./text.model")

class TextRepository {
  static createText(textPayload) {
    return Text.create(textPayload)
  }

  static async findSingleTextByParams(textPayload) {
    return Text.findOne({ ...textPayload })
  }

  static async fetchTextsByParams(textPayload) {
    const { limit, skip, sort, ...restOfPayload } = textPayload
    const texts = await Text.find({
      ...restOfPayload,
    })
      .populate("senderId", { fullName: 1 })
      .populate("recipientId", { fullName: 1 })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return texts
  }
}

module.exports = { TextRepository }
