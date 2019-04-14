import '../../__tests__/mock-config'

// @ts-ignore
import { createWriteStream, existsSync, mkdirSync, mockStream } from 'fs'

import { useFakeTimers } from 'sinon'

const clock = useFakeTimers({ now: new Date(1234567891011), shouldAdvanceTime: true, advanceTimeDelta: 50 })

jest.mock('fs', () => {
	const mockStream = { end: jest.fn(), write: jest.fn(), on: jest.fn() }
	return {
		existsSync: jest.fn(() => false),
		mkdirSync: jest.fn(),
		createWriteStream: jest.fn(() => mockStream),
		mockStream,
	}
})

const error = new Error('test')
error.stack = 'Error: test'

describe('logger', () => {
	beforeEach(() => {
		jest.spyOn(global.console, 'log').mockImplementation(() => null)
	})

	afterEach(() => {
		mockStream.end.mockClear()
		mockStream.write.mockClear()
		mockStream.on.mockClear()
		// @ts-ignore
		existsSync.mockClear()
		// @ts-ignore
		mkdirSync.mockClear()
		// @ts-ignore
		createWriteStream.mockClear()
		// @ts-ignore
		global.console.log.mockRestore()
	})

	it('create dir if missing ,write info to the output and console log', () => {
		const logger = require('../logger').default
		logger(1, 'testmessage1')
		expect(existsSync).toBeCalledTimes(1)
		expect(existsSync).toBeCalledWith('/test/root/log')
		expect(mkdirSync).toBeCalledTimes(1)
		expect(mkdirSync).toBeCalledWith('/test/root/log')
		expect(createWriteStream).toBeCalledTimes(1)
		// @ts-ignore
		expect(createWriteStream.mock.calls).toMatchSnapshot()
		expect(mockStream.write).toBeCalledTimes(1)
		expect(mockStream.write.mock.calls).toMatchSnapshot()
		expect(console.log).toBeCalledTimes(1)
		// @ts-ignore
		expect(console.log.mock.calls).toMatchSnapshot()
	})

	it('should parse errors , numbers and objects', () => {
		const logger = require('../logger').default
		logger(1, 'testmessage1', 1, error, { test: 'test' })
		expect(existsSync).toBeCalledTimes(0)
		expect(mkdirSync).toBeCalledTimes(0)
		expect(createWriteStream).toBeCalledTimes(0)
		expect(mockStream.write).toBeCalledTimes(1)
		expect(mockStream.write.mock.calls).toMatchSnapshot()
		expect(console.log).toBeCalledTimes(1)
		// @ts-ignore
		expect(console.log.mock.calls).toMatchSnapshot()
	})

	it('should parse errors , numbers and objects and pass on errors on failure', () => {
		const logger = require('../logger').default
		const testObject: { test: string; testObject?: any } = { test: 'test' }
		testObject.testObject = testObject
		logger(1, 'testmessage1', 1, error, { test: 'test' }, testObject)
		expect(existsSync).toBeCalledTimes(0)
		expect(mkdirSync).toBeCalledTimes(0)
		expect(createWriteStream).toBeCalledTimes(0)
		expect(mockStream.write).toBeCalledTimes(1)
		expect(mockStream.write.mock.calls).toMatchSnapshot()
		expect(console.log).toBeCalledTimes(2)
		// @ts-ignore
		expect(console.log.mock.calls).toMatchSnapshot()
	})

	it('should create new file if day changes', () => {
		const logger = require('../logger').default
		logger(1, 'testmessage1')
		expect(createWriteStream).toBeCalledTimes(0)
		expect(mockStream.end).toBeCalledTimes(0)
		expect(mockStream.write).toBeCalledTimes(1)

		clock.tick(1000 * 60 * 60 * 30)
		logger(1, 'testmessage1')
		expect(createWriteStream).toBeCalledTimes(1)
		expect(mockStream.end).toBeCalledTimes(1)
		expect(mockStream.write).toBeCalledTimes(2)
	})

	it('should output error in console on write error', () => {
		jest.resetModules()
		const { createWriteStream, mockStream } = require('fs')
		require('../logger').default
		expect(createWriteStream).toBeCalledTimes(1)
		expect(mockStream.on).toBeCalledTimes(1)
		mockStream.on.mock.calls[0][1]('testerror')
		expect(console.log).toBeCalledTimes(1)
		// @ts-ignore
		expect(console.log).toBeCalledWith('testerror')
	})

	it('write info to the output but not to console.log', () => {
		let logger
		// @ts-ignore
		jest.mock('fs', () => {
			const mockStream = { end: jest.fn(), write: jest.fn(), on: jest.fn() }
			return {
				existsSync: jest.fn(() => true),
				mkdirSync: jest.fn(),
				createWriteStream: jest.fn(() => mockStream),
				mockStream,
			}
		})
		jest.resetModules()
		logger = require('../logger').default
		const { createWriteStream, existsSync, mkdirSync, mockStream } = require('fs')
		logger(10, 'testmessage1')
		expect(existsSync).toBeCalledTimes(1)
		expect(existsSync).toBeCalledWith('/test/root/log')
		expect(mkdirSync).toBeCalledTimes(0)
		expect(createWriteStream).toBeCalledTimes(1)
		// @ts-ignore
		expect(createWriteStream.mock.calls).toMatchSnapshot()
		expect(mockStream.write).toBeCalledTimes(1)
		expect(mockStream.write.mock.calls).toMatchSnapshot()
		expect(console.log).toBeCalledTimes(0)
	})
})
