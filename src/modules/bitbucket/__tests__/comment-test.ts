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
		put: jest.fn(() => Promise.resolve({ id: 0, version: 1 })),
		post: jest.fn(() => Promise.resolve({ id: 0, version: 1 })),
	},
}))
jest.mock('../../db/comments', () => ({
	commentDb: { set: jest.fn(() => Promise.resolve()), get: jest.fn(() => Promise.resolve({ commentId: 'commentId' })) },
}))
jest.mock('../../../utils/parsing/create-comment', () => ({ createCommentObject: jest.fn(() => 'testcomment') }))
jest.mock('../../../utils/parsing/diff', () => ({ diffReports: jest.fn(() => 'diff') }))

describe('diff-module', () => {
	const testcomment = { commentId: 'commentId' }
	const repository = mockRepository
	const base = mockBranch
	const pr = mockPullRequest

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
	})

	it('should call all needed functions for update', () => {
		// @ts-ignore
		return writeReportToBitbucket(base, pr).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith('diff', testcomment)
			expect(Bitbucket.put).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/commentId', 'testcomment')
			expect(commentDb.set).toBeCalledWith(repository, pr.name, { ...testcomment, version: 1 })
		})
	})

	it('should call all needed functions for create', () => {
		// @ts-ignore
		commentDb.get.mockImplementation(() => Promise.resolve())
		// @ts-ignore
		return writeReportToBitbucket(base, pr).then(() => {
			expect(createCommentObject).toBeCalledTimes(1)
			expect(createCommentObject).toBeCalledWith('diff', undefined)
			expect(Bitbucket.post).toBeCalledWith('users/slug/repos/name/pull-requests/12345/comments/', 'testcomment')
			expect(commentDb.set).toBeCalledWith(repository, pr.name, { commentId: '0', version: 1 })
		})
	})
})
