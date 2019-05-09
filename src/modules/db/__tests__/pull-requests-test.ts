import '../../../__tests__/mock-config'

import { outputFile, readJSON } from 'fs-extra'

import initDb from '../../../utils/file-db'
import { mockPullRequestRest } from '../../../__tests__/data/pullrequests'
import { pullRequestDb } from '../pull-requests'
import { useFakeTimers } from 'sinon'

jest.mock('fs-extra', () => {
	let data

	return {
		outputFile: jest.fn((file, content) => {
			data = content
			return Promise.resolve()
		}),
		readJSON: jest.fn(() => Promise.resolve(JSON.parse(data))),
	}
})
jest.mock('../../../utils/logger')
jest.mock('../../../utils/file-db')

const mockDate = 1555194715066
const clock = useFakeTimers(new Date(mockDate))

const mockPullRequestRest2 = {
	...mockPullRequestRest,
	lcov: 'testurl',
	report: {
		...mockPullRequestRest.report,
		timestamp: mockDate,
	},
}

const base = {
	name: 'base',
	repository: { project: 'slug', repo: 'name', type: 'users' },
}

const dbPullRequest = {
	id: 'users_slug_name_12345',
	lastModified: mockDate,
	repository: { project: 'slug', repo: 'name', type: 'users' },
	name: '12345',
	base,
	task: false
}

const dbPullRequest2 = {
	...dbPullRequest,
	lcov: 'testurl',
	lastModified: mockDate + 1000,
}

describe('pullRequestDb', () => {
	let fileDb

	beforeAll(async () => {
		fileDb = await initDb('pullRequests.json')
	})

	afterEach(() => {
		fileDb.get.mockClear()
		fileDb.set.mockClear()
		outputFile.mockClear()
		readJSON.mockClear()
	})

	it('should call db.set with correct data on create and write report to disk', async () => {
		const branch = await pullRequestDb.create(mockPullRequestRest, base)

		expect(branch).toMatchObject(dbPullRequest)
		expect(fileDb.set).toBeCalledTimes(1)
		expect(fileDb.set).toBeCalledWith(dbPullRequest.id, dbPullRequest)
		expect(outputFile).toBeCalledWith(
			'/test/root/storage/pullRequests/pullRequest_users_slug_name_12345.json',
			JSON.stringify([mockPullRequestRest.report]),
			'utf8',
		)
	})

	it('should be unable to create branch with same id', async () => {
		try {
			await pullRequestDb.create(mockPullRequestRest, base)
		} catch (err) {
			expect(err).toEqual('Pull request already exists')
			return
		}
		expect(1).toEqual(0)
	})

	it('should be unable to update nonexisting branch', async () => {
		try {
			await pullRequestDb.update({ ...mockPullRequestRest, name: 'name' })
		} catch (err) {
			expect(err).toEqual('Pull request does not exist')
			return
		}
		expect(1).toEqual(0)
	})

	it('should call db.set with correct data on update and write report to disk', async () => {
		clock.tick(1000)

		const branch = await pullRequestDb.update(mockPullRequestRest2)

		expect(branch).toMatchObject(dbPullRequest2)
		expect(fileDb.set).toBeCalledTimes(1)
		expect(fileDb.set).toBeCalledWith(dbPullRequest2.id, dbPullRequest2)
		expect(outputFile).toBeCalledWith(
			'/test/root/storage/pullRequests/pullRequest_users_slug_name_12345.json',
			JSON.stringify([mockPullRequestRest2.report, mockPullRequestRest.report]),
			'utf8',
		)
	})

	it('should filter duplicate reports when writing to the disk', async () => {
		await pullRequestDb.update(mockPullRequestRest2)

		expect(outputFile).toBeCalledWith(
			'/test/root/storage/pullRequests/pullRequest_users_slug_name_12345.json',
			JSON.stringify([mockPullRequestRest2.report, mockPullRequestRest.report]),
			'utf8',
		)
	})

	it('should call db.get when getting data and properly merge stored data with report', async () => {
		const branch = await pullRequestDb.get(dbPullRequest.repository, dbPullRequest.name)

		expect(branch).toMatchObject({ ...dbPullRequest2, reports: [mockPullRequestRest2.report, mockPullRequestRest.report] })
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith(dbPullRequest2.id)
		expect(readJSON).toBeCalledWith('/test/root/storage/pullRequests/pullRequest_users_slug_name_12345.json', 'utf8')
	})

	it("should return null and not try to read file on get when branch doesn't exist", async () => {
		const branch = await pullRequestDb.get(dbPullRequest.repository, 'name')

		expect(branch).toBeNull()
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith('users_slug_name_name')
		expect(readJSON).toBeCalledTimes(0)
	})

	it('should call db.get but not read report when checking existence', async () => {
		const branch = await pullRequestDb.exists(dbPullRequest.repository, dbPullRequest.name)

		expect(branch).toBeTruthy()
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith(dbPullRequest2.id)
		expect(readJSON).toBeCalledTimes(0)
	})
})
