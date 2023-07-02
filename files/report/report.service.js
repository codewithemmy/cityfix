const { queryConstructor } = require("../../utils")
const { ReportFailure, ReportSuccess } = require("./report.messages")
const { ReportRepository } = require("./report.repository")

class ReportService {
  static async createReport(payload, locals) {
    const report = await ReportRepository.create({
      ...payload,
      reporterId: locals._id,
    })

    if (!report) return { success: false, msg: ReportFailure.CREATE }

    return { success: true, msg: ReportSuccess.CREATE }
  }

  static async getReport() {
    const report = await ReportRepository.findReportWithParams()

    if (!report) return { success: false, msg: ReportFailure.FETCH }

    return { success: true, msg: ReportSuccess.FETCH, data: report }
  }
}

module.exports = { ReportService }
