import { createReportFromXML } from '../../../utils/parsing/parse-report'
import { readFileSync } from 'fs'
import request from 'request-promise-native'
import { writeReportToBitbucket } from '../comment'

jest.mock('request-promise-native', () =>
	require
		.requireActual('sinon')
		.stub()
		.resolves(),
)

jest.mock('../../../utils/logger.ts', () => () => null)

describe('diff-module', () => {
	const report = createReportFromXML(readFileSync('./tests/sample_report.xml', { encoding: 'utf8' }))
	const report2 = createReportFromXML(readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' }))
	const repository = {
		repo: 'name',
		project: 'slug',
		type: 'users',
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
		name: '12345',
		id: '1',
		lastModified: 0,
		base: {
			name: 'base',
			repository,
		},
	}

	it('should find the diff between the reports', () => {
		return writeReportToBitbucket(base, pr).then(() => {
			expect(request.callCount).toEqual(1)
			expect(request.firstCall.args).toMatchSnapshot()
		})
	})
})
