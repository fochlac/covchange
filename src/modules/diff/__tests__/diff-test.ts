import { createReportFromXML } from '../../../utils/parse-report'
import { diffReports } from '../diff'
import { readFileSync } from 'fs'

describe('diff-module', () => {
	const report = createReportFromXML(readFileSync('./tests/sample_report.xml', { encoding: 'utf8' }))
	const report2 = createReportFromXML(readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' }))

	it('should find the diff between the reports', () => {
		expect(diffReports(report, report2)).toMatchSnapshot()
	})
})
