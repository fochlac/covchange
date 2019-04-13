import { createCommentObject } from '../create-comment'
import { createReportFromXML } from '../parse-report'
import { diffReports } from '../diff'
import { readFileSync } from 'fs'

describe('diff-module', () => {
	const report = createReportFromXML(readFileSync('./tests/sample_report.xml', { encoding: 'utf8' }))
	const report2 = createReportFromXML(readFileSync('./tests/sample_report_2.xml', { encoding: 'utf8' }))
	const diff = diffReports(report, report2)

	it('should create a comment from the diff report', () => {
		const comment = createCommentObject(diff)
		expect(comment.version).toBeUndefined()
		expect(comment).toMatchSnapshot()
	})

	it('should create a comment from the diff report', () => {
		const comment = createCommentObject(diff, { id: '0', commentId: '0', version: 1 })
		expect(comment.version).toEqual(1)
	})
})
