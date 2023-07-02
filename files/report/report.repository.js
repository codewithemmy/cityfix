const { Report } = require("./report.model")

class ReportRepository {
  static async create(payload) {
    return Report.create(payload)
  }

  static async findReportWithParams(payload, select) {
    return Report.find({ ...payload })
      .select(select)
      .populate({ path: "reporterId" })
  }

  static async validateReport(payload) {
    return Report.exists({ ...payload })
  }

  static async findAllReportParams(payload) {
    const { limit, skip, sort, ...restOfPayload } = payload

    const report = await Report.find({ ...restOfPayload })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return report
  }
}

module.exports = { ReportRepository }
