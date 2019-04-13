import { createReportFromXML } from '../../utils/parsing/parse-report'
import { readFileSync } from 'fs'

const mockReport = createReportFromXML(readFileSync('./tests/sample_report.xml', { encoding: 'utf8' }))
const mockReport2 = createReportFromXML(readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' }))

export { mockReport, mockReport2 }
