const { Notification } = require("./notification.model")

class NotificationRepository {
  static async createNotification(notificationPayload) {
    return await Notification.create(notificationPayload)
  }

  static async findSingleNotificationByParams(notificationPayload) {
    return await Notification.findOne({ ...notificationPayload })
  }

  static async fetchNotificationsByParams(userPayload) {
    const notification = await Notification.find({
      ...userPayload,
    })
      .populate("userId", {
        name: 1,
        firstName: 1,
        lastName: 1,
        profileImage: 1,
      })
      .populate("recipientId", {
        name: 1,
        firstName: 1,
        lastName: 1,
      })

    return notification
  }
}

module.exports = { NotificationRepository }
