import '../../../__tests__/mock-config'

import { Bitbucket } from '../bitbucket'
import request from 'request-promise-native'

jest.mock('request-promise-native', () => jest.fn(() => Promise.resolve()))
jest.mock('../../../utils/logger')

describe('get-base-branch', () => {
	afterEach(() => {
		request.mockClear()
	})

	it('should create a get request object using the url', () => {
		return Bitbucket.get('testurl').then(() => {
			expect(request).toBeCalledTimes(1)
			expect(request.mock.calls).toMatchSnapshot()
		})
	})

	it('should create a put request object using the url', () => {
		return Bitbucket.put('testurl', { test: 'test' }).then(() => {
			expect(request).toBeCalledTimes(1)
			expect(request.mock.calls).toMatchSnapshot()
		})
	})

	it('should create a post request object using the url', () => {
		return Bitbucket.post('testurl', { test: 'test' }).then(() => {
			expect(request).toBeCalledTimes(1)
			expect(request.mock.calls).toMatchSnapshot()
		})
	})
})
