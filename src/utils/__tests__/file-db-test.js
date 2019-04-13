import '../../__tests__/mock-config'

import { moveSync, outputFile, pathExists, readJSON } from 'fs-extra'

import initDb from '../file-db'
import { useFakeTimers } from 'sinon'

useFakeTimers({ now: new Date(1234567891011), shouldAdvanceTime: true, advanceTimeDelta: 50 })

jest.mock('../error', () => jest.fn(() => ({ internalError: jest.fn(() => () => null) })))
jest.mock('../logger', () => () => null)
jest.mock('fs-extra', () => ({
	moveSync: jest.fn(),
	outputFile: jest.fn(() => Promise.resolve()),
	pathExists: jest.fn(() => Promise.resolve(true)),
	readJSON: jest.fn(),
}))

describe('get-base-branch', () => {
	afterEach(() => {
		moveSync.mockClear()
		outputFile.mockClear()
		pathExists.mockClear()
		readJSON.mockClear()
	})

	it('should move old file if unreadable', () => {
		readJSON.mockImplementation(() => Promise.reject())
		return initDb('name.ext').then(fileDb => {
			expect(pathExists).toHaveBeenCalledTimes(1)
			expect(pathExists.mock.calls).toMatchSnapshot()
			expect(readJSON).toHaveBeenCalledTimes(1)
			expect(readJSON.mock.calls).toMatchSnapshot()
			expect(moveSync).toHaveBeenCalledTimes(1)
			expect(moveSync.mock.calls).toMatchSnapshot()
		})
	})

	it('should use stored data', () => {
		readJSON.mockImplementation(() => Promise.resolve({ test: 'test' }))
		return initDb('name.ext').then(fileDb => {
			expect(pathExists).toHaveBeenCalledTimes(1)
			expect(readJSON).toHaveBeenCalledTimes(1)
			expect(moveSync).toHaveBeenCalledTimes(0)

			expect(fileDb.get('test')).toEqual('test')
			expect(fileDb.get('test2')).toEqual(undefined)
			fileDb.set('test2', 'testdata')
			expect(fileDb.get('test2')).toEqual('testdata')
		})
	})

	it('should write stored data', () => {
		readJSON.mockImplementation(() => Promise.resolve({ test: 'test' }))
		return initDb('name.ext')
			.then(fileDb => {
				fileDb.set('test2', 'testdata')
				expect(fileDb.get('test2')).toEqual('testdata')

				return new Promise(resolve => setTimeout(resolve, 2))
			})
			.then(() => {
				expect(outputFile).toHaveBeenCalledTimes(1)
				expect(outputFile.mock.calls).toMatchSnapshot()
			})
	})

	it('should store data immutably', () => {
		readJSON.mockImplementation(() => Promise.resolve({ test: 'test' }))
		return initDb('name.ext').then(fileDb => {
			const testObj = { test: 'testdata' }
			fileDb.set('test2', testObj)
			testObj.test2 = 'test2'
			testObj.test = 'test1'
			expect(fileDb.get('test2')).toMatchObject({ test: 'testdata' })
			const testObj2 = fileDb.get('test2')
			testObj2.test2 = 'test2'
			testObj2.test = 'test1'
			expect(fileDb.get('test2')).toMatchObject({ test: 'testdata' })
		})
	})

	it('should increment the index', () => {
		readJSON.mockImplementation(() => Promise.resolve({ test: 'test' }))
		return initDb('name.ext').then(fileDb => {
			expect(fileDb.nextIndex).toEqual('1')
			expect(fileDb.nextIndex).toEqual('2')
		})
	})

	it('should increment the index starting from the highest existing value', () => {
		readJSON.mockImplementation(() => Promise.resolve({ '22': 'test' }))
		return initDb('name.ext').then(fileDb => {
			expect(fileDb.nextIndex).toEqual('23')
			expect(fileDb.nextIndex).toEqual('24')
		})
	})

	it('should list all entries', () => {
		const initialState = {
			test: 'test',
			test2: 'test2',
			test3: 'test3',
		}
		readJSON.mockImplementation(() => Promise.resolve(initialState))
		return initDb('name.ext').then(fileDb => {
			expect(fileDb.list()).toEqual(Object.values(initialState))
		})
	})

	it('should find the correct entries', () => {
		const initialState = {
			test: { key: 'test' },
			test2: { key: 'test2' },
			test3: { key: 'test3' },
		}
		readJSON.mockImplementation(() => Promise.resolve(initialState))
		return initDb('name.ext').then(fileDb => {
			expect(fileDb.find('key', 'test2')[0]).toMatchObject(initialState.test2)
			expect(fileDb.find('key', 'test2')).toHaveLength(1)
		})
	})

	it('should set multiple entries', async () => {
		const initialState = {
			test: { key: 'test' },
			test2: { key: 'test2' },
			test3: { key: 'test3' },
		}
		pathExists.mockImplementation(() => Promise.resolve(false))
		readJSON.mockImplementation(() => Promise.reject())
		const fileDb = await initDb('name.ext')
		const result = await fileDb.setMultiple(initialState)
		expect(result).toEqual(initialState)
		expect(fileDb.list()).toEqual(Object.values(initialState))
	})

	it('should delete entries', async () => {
		const initialState = {
			test: 'test',
			test2: 'test2',
			test3: 'test3',
		}
		pathExists.mockImplementation(() => true)
		readJSON.mockImplementation(() => Promise.resolve(initialState))
		const fileDb = await initDb('name.ext')
		expect(fileDb.list()).toEqual(Object.values(initialState))
		const id = await fileDb.delete('test2')
		expect(fileDb.list()).toHaveLength(2)
		expect(fileDb.list()).toEqual([initialState.test, initialState.test3])
		expect(id).toEqual('test2')
	})
})
