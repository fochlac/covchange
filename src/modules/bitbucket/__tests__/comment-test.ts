import { createReportFromXML } from '../../../utils/parse-report'
import { readFileSync } from 'fs'
import request from 'request-promise-native'
import { submitResults } from '../comment'

jest.mock('request-promise-native', () =>
	require
		.requireActual('sinon')
		.stub()
		.resolves(),
)

describe('diff-module', () => {
	const report = createReportFromXML(readFileSync('./tests/sample_report.xml', { encoding: 'utf8' }))
	const report2 = createReportFromXML(readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' }))
	const repository = {
		name: 'name',
		slug: 'slug',
	}
	const base = {
		name: 'base',
		reports: [report],
		repository,
		id: '1',
		lastModified: 0,
	}
	const pr = {
		reports: [report2],
		repository,
		pullRequestId: '12345',
		id: '1',
		lastModified: 0,
		base: {
			name: 'base',
			repository,
		},
	}

	it('should find the diff between the reports', () => {
		return submitResults(base, pr).then(() => {
			expect(request.callCount).toEqual(1)
			expect(request.firstCall.args).toMatchSnapshot()
		})
	})
})
