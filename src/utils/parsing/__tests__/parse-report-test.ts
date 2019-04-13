import { createReportFromXML } from '../parse-report'
import { readFileSync } from 'fs'

const report = readFileSync('./tests/sample_report.xml', { encoding: 'utf8' })

describe('createReportFromXML', () => {
	it('should properly parse an xml file', () => {
		expect(createReportFromXML(report)).toMatchSnapshot()
	})
})
