const { queryConstructor } = require("../../utils")
const { ReportFailure, ReportSuccess } = require("./report.messages")
const { ReportRepository } = require("./report.repository")

class ReportService {
  static async createReport(payload, locals) {
    const { image, body } = payload

    const report = await ReportRepository.create({
      ...body,
      image,
      reporterId: locals,
    })

    if (!report) return { success: false, msg: ReportFailure.CREATE }

    return { success: true, msg: ReportSuccess.CREATE, report }
  }

  static async getReport(payload) {
    const { error, params, limit, skip, sort } = queryConstructor(
      payload,
      "createdAt",
      "Report"
    )
    if (error) return { success: false, msg: error }

    const report = await ReportRepository.findAllReportParams({
      ...params,
      limit,
      skip,
      sort,
    })

    if (!report) return { success: false, msg: ReportFailure.FETCH }

    return { success: true, msg: ReportSuccess.FETCH, data: report }
  }
}

module.exports = { ReportService }
