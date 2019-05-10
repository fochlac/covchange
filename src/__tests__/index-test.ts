import logger from '../utils/logger'
import server from '../index'

jest.mock('../utils/logger')

describe('start server', () => {
	it('should start server', async () => {
		await server
		expect(logger).toHaveBeenCalledTimes(5)
		// @ts-ignore
		expect(logger.mock.calls).toMatchSnapshot()
	})
})
