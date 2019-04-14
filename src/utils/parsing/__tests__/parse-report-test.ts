import { createReportFromXML } from '../parse-report'
import { reportRaw } from '../../../__tests__/data/reports'

describe('createReportFromXML', () => {
	it('should properly parse an xml file', () => {
		expect(createReportFromXML(reportRaw)).toMatchSnapshot()
	})
})
