import { mockReport, mockReport2 } from '../../../__tests__/data/reports'

import { diffReports } from '../diff'

describe('diff-module', () => {
	it('should find the diff between the reports', () => {
		expect(diffReports(mockReport, mockReport2)).toMatchSnapshot()
	})
})
