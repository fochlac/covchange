import { mockReport, mockReport2 } from '../../../__tests__/data/reports'

import { createCommentObject } from '../create-comment'
import { diffReports } from '../diff'

jest.mock('../../../utils/logger.ts', () => () => null)

describe('diff-module', () => {
	const diff = diffReports(mockReport, mockReport2)
	const diff_same = diffReports(mockReport, mockReport)

	it('should create a comment from the diff report', () => {
		const comment = createCommentObject(diff)
		expect(comment.version).toBeUndefined()
		expect(comment).toMatchSnapshot()
	})

	it('should create a comment from diff of equal reports', () => {
		const comment = createCommentObject(diff_same)
		expect(comment.version).toBeUndefined()
		expect(comment).toMatchSnapshot()
	})

	it('should create a comment from the diff report', () => {
		const comment = createCommentObject(diff, { id: '0', commentId: '0', version: 1 })
		expect(comment.version).toEqual(1)
	})

	it('should create a comment from the diff report', () => {
		const comment = createCommentObject(diff, { id: '0', commentId: '0', version: 1 }, 'http://ttbsbld102.dev.ttw:8080/job/Atlantis-PR/298936/PR-UnitTestCoverage')
		expect(comment).toMatchSnapshot()
	})
})
