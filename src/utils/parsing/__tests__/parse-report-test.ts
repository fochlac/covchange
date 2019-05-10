import { createReportFromXML } from '../parse-report'
import { reportRaw, reportRaw3 } from '../../../__tests__/data/reports'

describe('createReportFromXML', () => {
	it('should properly parse an xml file', () => {
		expect(createReportFromXML(reportRaw)).toMatchSnapshot()
		expect(createReportFromXML(reportRaw3)).toMatchSnapshot()
	})
})
