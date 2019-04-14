import '../../../__tests__/mock-config'

import { outputFile, readJSON } from 'fs-extra'

import { branchDb } from '../branches'
import initDb from '../../../utils/file-db'
import { mockBranchRest } from '../../../__tests__/data/branches'
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

const mockBranchRest2 = {
	...mockBranchRest,
	report: {
		...mockBranchRest.report,
		timestamp: mockDate,
	},
}

const dbBranch = {
	id: 'users_slug_name_base',
	lastModified: mockDate,
	name: 'base',
	repository: { project: 'slug', repo: 'name', type: 'users' },
}

const dbBranch2 = {
	...dbBranch,
	lastModified: mockDate + 1000,
}

describe('branchdb', () => {
	let fileDb

	beforeAll(async () => {
		fileDb = await initDb('branches.json')
	})

	afterEach(() => {
		fileDb.get.mockClear()
		fileDb.set.mockClear()
		outputFile.mockClear()
		readJSON.mockClear()
	})

	it('should call db.set with correct data on create and write report to disk', async () => {
		const branch = await branchDb.create(mockBranchRest)

		expect(branch).toMatchObject(dbBranch)
		expect(fileDb.set).toBeCalledTimes(1)
		expect(fileDb.set).toBeCalledWith(dbBranch.id, dbBranch)
		expect(outputFile).toBeCalledWith(
			'/test/root/storage/branches/branch_users_slug_name_base.json',
			JSON.stringify([mockBranchRest.report]),
			'utf8',
		)
	})

	it('should be unable to create branch with same id', async () => {
		try {
			await branchDb.create(mockBranchRest)
		} catch (err) {
			expect(err).toEqual('Branch already exists')
			return
		}
		expect(1).toEqual(0)
	})

	it('should be unable to update nonexisting branch', async () => {
		try {
			await branchDb.update({ ...mockBranchRest, name: 'name' })
		} catch (err) {
			expect(err).toEqual('Branch does not exist')
			return
		}
		expect(1).toEqual(0)
	})

	it('should call db.set with correct data on update and write report to disk', async () => {
		clock.tick(1000)

		const branch = await branchDb.update(mockBranchRest2)

		expect(branch).toMatchObject(dbBranch2)
		expect(fileDb.set).toBeCalledTimes(1)
		expect(fileDb.set).toBeCalledWith(dbBranch2.id, dbBranch2)
		expect(outputFile).toBeCalledWith(
			'/test/root/storage/branches/branch_users_slug_name_base.json',
			JSON.stringify([mockBranchRest2.report, mockBranchRest.report]),
			'utf8',
		)
	})

	it('should filter duplicate reports when writing to the disk', async () => {
		await branchDb.update(mockBranchRest2)

		expect(outputFile).toBeCalledWith(
			'/test/root/storage/branches/branch_users_slug_name_base.json',
			JSON.stringify([mockBranchRest2.report, mockBranchRest.report]),
			'utf8',
		)
	})

	it('should call db.get when getting data and properly merge stored data with report', async () => {
		const branch = await branchDb.get(dbBranch.repository, dbBranch.name)

		expect(branch).toMatchObject({ ...dbBranch2, reports: [mockBranchRest2.report, mockBranchRest.report] })
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith(dbBranch2.id)
		expect(readJSON).toBeCalledWith('/test/root/storage/branches/branch_users_slug_name_base.json', 'utf8')
	})

	it("should return null and not try to read file on get when branch doesn't exist", async () => {
		const branch = await branchDb.get(dbBranch.repository, 'name')

		expect(branch).toBeNull()
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith('users_slug_name_name')
		expect(readJSON).toBeCalledTimes(0)
	})

	it('should call db.get but not read report when checking existence', async () => {
		const branch = await branchDb.exists(dbBranch.repository, dbBranch.name)

		expect(branch).toBeTruthy()
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith(dbBranch2.id)
		expect(readJSON).toBeCalledTimes(0)
	})
})
