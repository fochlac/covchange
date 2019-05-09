import { openTask, resolveTask } from '../tasks'

import { Bitbucket } from '../bitbucket'
import { commentDb } from '../../db/comments'
import { createCommentObject } from '../../../utils/parsing/create-comment'
import { diffReports } from '../../../utils/parsing/diff'
import { mockBranch } from '../../../__tests__/data/branches'
import { mockPullRequest } from '../../../__tests__/data/pullrequests'
import { mockRepository } from '../../../__tests__/data/repository'
import { writeReportToBitbucket } from '../comment'

jest.mock('../bitbucket', () => ({
	Bitbucket: {
		get: jest.fn(() => Promise.resolve({ id: 12, version: 2 })),
		put: jest.fn(() => Promise.resolve({ id: 12, version: 1 })),
		post: jest.fn(() => Promise.resolve({ id: 12, version: 1 })),
	},
}))
jest.mock('../../db/comments', () => ({
	commentDb: { set: jest.fn(() => Promise.resolve()), get: jest.fn(() => Promise.resolve({ commentId: 'commentId' })) },
}))
jest.mock('../tasks', () => ({
	openTask: jest.fn(() => Promise.resolve('23')),
	resolveTask: jest.fn(() => Promise.resolve()),
}))
jest.mock('../../../utils/parsing/create-comment', () => ({ createCommentObject: jest.fn(() => ({ text: 'testcomment' })) }))
jest.mock('../../../utils/parsing/diff', () => ({ diffReports: jest.fn(() => mockDiffNegative) }))
const mockDiffNegative = { total: { diff: { statementCov: -5 } } }
const mockDiffPositive = { total: { diff: { statementCov: 5 } } }

function setGetComment(comment?: any) {
	// @ts-ignore
	commentDb.get.mockImplementation(() => Promise.resolve(comment))
	return comment
}
function positiveDiff() {
	// @ts-ignore
	diffReports.mockImplementation(jest.fn(() => mockDiffPositive))
}
function negativeDiff() {
	// @ts-ignore
	diffReports.mockImplementation(jest.fn(() => mockDiffNegative))
}

describe('diff-module', () => {
	const testcomment = { commentId: 'commentId' }
	const repository = mockRepository
	const base = mockBranch
	const pr = mockPullRequest
	const prWithTask = { ...mockPullRequest, task: true, lcov: 'testurl' }

	afterEach(() => {
		// @ts-ignore
		createCommentObject.mockClear()
		// @ts-ignore
		Bitbucket.put.mockClear()
		// @ts-ignore
		commentDb.set.mockClear()
		// @ts-ignore
		commentDb.get.mockClear()
		// @ts-ignore
		Bitbucket.post.mockClear()
		// @ts-ignore
		openTask.mockClear()
		// @ts-ignore
		resolveTask.mockClear()
	})

	it('should call all needed functions for update without task', () => {
		negativeDiff()
		return writeReportToBitbucket(base, pr).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(commentDb.get).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith(mockDiffNegative, testcomment, undefined)
			expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/commentId')
			expect(Bitbucket.put).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/12', {
				text: 'testcomment',
				version: 2,
			})
			expect(commentDb.set).toBeCalledWith(repository, pr.name, { commentId: '12', version: 1 })
			expect(openTask).toBeCalledTimes(0)
			expect(resolveTask).toBeCalledTimes(0)
		})
	})

	it('should call all needed functions for update without task, but existing taskid', () => {
		const testcomment2 = setGetComment({ commentId: '12', taskId: '42' })
		positiveDiff()
		return writeReportToBitbucket(base, pr).then(() => {
			expect(commentDb.set).toBeCalledWith(repository, pr.name, { ...testcomment2, version: 1 })
			expect(openTask).toBeCalledTimes(0)
			expect(resolveTask).toBeCalledTimes(1)
		})
	})

	it('should call all needed functions for update with task', () => {
		const testcomment2 = setGetComment({ commentId: 'commentId', taskId: '42' })
		negativeDiff()
		return writeReportToBitbucket(base, prWithTask).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith(mockDiffNegative, testcomment2, 'testurl')
			expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/commentId')
			expect(Bitbucket.put).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/12', {
				text: 'testcomment',
				version: 2,
			})
			expect(commentDb.set).toBeCalledWith(repository, prWithTask.name, { commentId: '12', version: 1, taskId: '23' })
			expect(openTask).toBeCalledTimes(1)
			expect(resolveTask).toBeCalledTimes(0)
		})
	})

	it('should call all needed functions for create without task', () => {
		setGetComment()
		positiveDiff()
		return writeReportToBitbucket(base, pr).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith(mockDiffPositive, undefined, undefined)
			expect(Bitbucket.post).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/', { text: 'testcomment' })
			expect(commentDb.set).toBeCalledWith(repository, pr.name, { commentId: '12', version: 1 })
			expect(openTask).toBeCalledTimes(0)
			expect(resolveTask).toBeCalledTimes(0)
		})
	})

	it('should call all needed functions for create with task', () => {
		negativeDiff()
		return writeReportToBitbucket(base, prWithTask).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith(mockDiffNegative, undefined, 'testurl')
			expect(Bitbucket.post).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/', { text: 'testcomment' })
			expect(commentDb.set).toBeCalledWith(repository, prWithTask.name, { commentId: '12', version: 1, taskId: '23' })
			expect(openTask).toBeCalledTimes(1)
			expect(resolveTask).toBeCalledTimes(0)
		})
	})
})
