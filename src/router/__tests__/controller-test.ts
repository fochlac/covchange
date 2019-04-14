import { addBranchReport, addPullRequestReport } from '../controllers'
import { mockBranch, mockBranchRest } from '../../__tests__/data/branches'
import { mockPullRequest, mockPullRequestRest } from '../../__tests__/data/pullrequests'

import { branchDb } from '../../modules/db/branches'
import logger from '../../utils/logger'
import { pullRequestDb } from '../../modules/db/pull-requests'
import { writeReportToBitbucket } from '../../modules/bitbucket/comment'

jest.mock('../../utils/logger')
jest.mock('../../modules/db/pull-requests', () => ({
	pullRequestDb: {
		exists: jest.fn(() => Promise.resolve(false)),
		update: jest.fn(() => Promise.resolve(mockPullRequest)),
		create: jest.fn(() => Promise.resolve(mockPullRequest)),
	},
}))
jest.mock('../../modules/db/branches', () => ({
	branchDb: {
		exists: jest.fn(() => Promise.resolve(false)),
		update: jest.fn(() => Promise.resolve(mockBranch)),
		create: jest.fn(() => Promise.resolve(mockBranch)),
		get: jest.fn(() => Promise.resolve(mockBranch)),
	},
}))
jest.mock('../../modules/bitbucket/get-base-branch', () => ({
	getBaseBranchFromPullrequest: jest.fn(() => Promise.resolve(mockBranch)),
}))
jest.mock('../../modules/bitbucket/comment', () => ({
	writeReportToBitbucket: jest.fn(() => Promise.resolve()),
}))

const req_branch = { body: mockBranchRest }
const req_pr = { body: mockPullRequestRest }
const send = jest.fn()
const res = { status: jest.fn(() => ({ send })) }

describe('controllers', () => {
	afterEach(() => {
		// @ts-ignore
		pullRequestDb.exists.mockClear()
		// @ts-ignore
		pullRequestDb.create.mockClear()
		// @ts-ignore
		pullRequestDb.update.mockClear()
		// @ts-ignore
		branchDb.exists.mockClear()
		// @ts-ignore
		branchDb.create.mockClear()
		// @ts-ignore
		branchDb.update.mockClear()
		// @ts-ignore
		branchDb.get.mockClear()
		send.mockClear()
		res.status.mockClear()
		// @ts-ignore
		writeReportToBitbucket.mockClear()
	})

	it('addBranchReport > should create new branch report if it doesnt exist', async () => {
		await addBranchReport(req_branch, res)

		expect(branchDb.exists).toBeCalledTimes(1)
		expect(branchDb.exists).toBeCalledWith(mockBranchRest.repository, mockBranchRest.name)
		expect(branchDb.create).toBeCalledTimes(1)
		expect(branchDb.create).toBeCalledWith(mockBranchRest)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: true })
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(200)
	})

	it('addBranchReport > should update branch report if it exists', async () => {
		// @ts-ignore
		branchDb.exists.mockImplementation(() => Promise.resolve(true))
		await addBranchReport(req_branch, res)

		expect(branchDb.exists).toBeCalledTimes(1)
		expect(branchDb.exists).toBeCalledWith(mockBranchRest.repository, mockBranchRest.name)
		expect(branchDb.update).toBeCalledTimes(1)
		expect(branchDb.update).toBeCalledWith(mockBranchRest)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: true })
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(200)
	})

	it('addBranchReport > should handle errors', async () => {
		// @ts-ignore
		branchDb.update.mockImplementation(() => Promise.reject('testerror'))
		await addBranchReport(req_branch, res)

		expect(branchDb.exists).toBeCalledTimes(1)
		expect(branchDb.exists).toBeCalledWith(mockBranchRest.repository, mockBranchRest.name)
		expect(branchDb.update).toBeCalledTimes(1)
		expect(branchDb.update).toBeCalledWith(mockBranchRest)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: false })
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(500)
	})

	it('addBranchReport > should create branch report if it exists', async () => {
		await addPullRequestReport(req_pr, res)

		expect(pullRequestDb.exists).toBeCalledTimes(1)
		expect(pullRequestDb.exists).toBeCalledWith(mockPullRequestRest.repository, mockPullRequestRest.name)
		expect(branchDb.get).toBeCalledTimes(1)
		expect(pullRequestDb.create).toBeCalledTimes(1)
		expect(pullRequestDb.create).toBeCalledWith(mockPullRequestRest, mockBranch)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: true })
		expect(res.status).toBeCalledTimes(1)
		expect(writeReportToBitbucket).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(200)
	})

	it('addBranchReport > should update branch report if it exists', async () => {
		// @ts-ignore
		pullRequestDb.exists.mockImplementation(() => Promise.resolve(true))
		await addPullRequestReport(req_pr, res)

		expect(pullRequestDb.exists).toBeCalledTimes(1)
		expect(pullRequestDb.exists).toBeCalledWith(mockPullRequestRest.repository, mockPullRequestRest.name)
		expect(branchDb.get).toBeCalledTimes(1)
		expect(pullRequestDb.create).toBeCalledTimes(0)
		expect(pullRequestDb.update).toBeCalledTimes(1)
		expect(pullRequestDb.update).toBeCalledWith(mockPullRequestRest, mockBranch)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: true })
		expect(res.status).toBeCalledTimes(1)
		expect(writeReportToBitbucket).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(200)
	})

	it('addBranchReport > should throw internal error if writeToBitbucket fails', async () => {
		// @ts-ignore
		writeReportToBitbucket.mockImplementation(() => Promise.reject(null))
		await addPullRequestReport(req_pr, res)

		expect(pullRequestDb.exists).toBeCalledTimes(1)
		expect(pullRequestDb.exists).toBeCalledWith(mockPullRequestRest.repository, mockPullRequestRest.name)
		expect(branchDb.get).toBeCalledTimes(1)
		expect(pullRequestDb.create).toBeCalledTimes(0)
		expect(pullRequestDb.update).toBeCalledTimes(1)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: true })
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(200)
		expect(writeReportToBitbucket).toBeCalledTimes(1)
		// @ts-ignore
		expect(logger.mock.calls).toMatchSnapshot
	})

	it('addBranchReport > should throw if no base branch exists', async () => {
		// @ts-ignore
		branchDb.get.mockImplementation(() => Promise.resolve(null))
		await addPullRequestReport(req_pr, res)

		expect(pullRequestDb.exists).toBeCalledTimes(1)
		expect(pullRequestDb.exists).toBeCalledWith(mockPullRequestRest.repository, mockPullRequestRest.name)
		expect(branchDb.get).toBeCalledTimes(1)
		expect(pullRequestDb.create).toBeCalledTimes(0)
		expect(pullRequestDb.update).toBeCalledTimes(0)
		expect(send).toBeCalledTimes(1)
		expect(send).toBeCalledWith({ success: false })
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(500)
		expect(writeReportToBitbucket).toBeCalledTimes(0)
	})
})
