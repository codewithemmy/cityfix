const { Report } = require("./report.model")

class ReportRepository {
  static async create(payload) {
    return Report.create(payload)
  }

  static async findReportWithParams(payload, select) {
    return Report.find({ ...payload })
      .select(select)
      .populate({
        path: "reporterId",
        select: "firstName lastName name profileImage accountType",
      })
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
      .populate({
        path: "reporterId",
        select: "firstName lastName name profileImage accountType",
      })

    return report
  }
}

module.exports = { ReportRepository }

// static async searchEnterprise(enterprisePayload) {
//     const { status, search, startDate, endDate } = enterprisePayload

//     const enterprise = await EnterpriseRepository.searchUser({
//       status,
//       search,
//       startDate,
//       endDate,
//     })

//     if (enterprise.length < 1)
//       return { success: false, msg: EnterpriseFailure.FETCH }

//     return { success: true, msg: EnterpriseSuccess.FETCH, data: enterprise }
//   }


//  let extras = {}
//  if (params.from && params.to) {
//    const dateFrom = new Date(params.from)
//    const dateTo = new Date(query.to)
//    dateTo.setHours(23, 59, 59, 999)
//    const dateFromUtc = dateFrom.toISOString()
//    const dateToUtc = dateTo.toISOString()

//    extras = { createdAt: { $gte: dateFromUtc, $lte: dateToUtc } }
//    delete params.to
//    delete params.from
//  }

  // static async searchEnterprise(query) {
  //   let { startDate, endDate, status, search } = query

  //   if (!search) search = ""

  //   let extraParams = {}

  //   if (status && status.length > 0) extraParams.status = status
  //   if (startDate && endDate)
  //     extraParams.date = {
  //       $gte: startDate,
  //       $lte: endDate,
  //     }

  //   const enterpriseSearch = await Enterprise.aggregate([
  //     {
  //       $addFields: {
  //         date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  //       },
  //     },
  //     {
  //       $match: {
  //         $and: [
  //           {
  //             $or: [
  //               { name: { $regex: search, $options: "i" } },
  //               { email: { $regex: search, $options: "i" } },
  //             ],
  //             ...extraParams,
  //           },
  //         ],
  //       },
  //     },
  //   ])

  //   return enterpriseSearch
  // }