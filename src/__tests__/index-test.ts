import logger from '../utils/logger'
import server from '../index'

jest.mock('../utils/logger')

describe('start server', () => {
	it('should start server', async () => {
		await server
		expect(logger).toBeCalledTimes(1)
		expect(logger).toMatchSnapshot()
	})
})
