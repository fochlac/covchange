import { createReportFromXML } from '../../utils/parsing/parse-report'
import { readFileSync } from 'fs'

const reportRaw = readFileSync('./tests/sample_report.xml', { encoding: 'utf8' })
const reportRaw2 = readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' })

const mockReport = createReportFromXML(reportRaw)
const mockReport2 = createReportFromXML(reportRaw2)

export { mockReport, mockReport2, reportRaw, reportRaw2 }
