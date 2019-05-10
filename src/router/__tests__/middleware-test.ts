import { parseReport } from '../middleware'
import { reportRaw } from '../../__tests__/data/reports'

jest.mock('../../utils/logger')

describe('middleware', () => {
	it('parseReport > should parse the xml in req.body.report', () => {
		const next = jest.fn()
		const req = { body: { report: reportRaw } }
		parseReport(req, null, next)
		expect(next).toBeCalledTimes(1)
		expect(req.body.report).toMatchSnapshot()
	})

	it('parseReport > should parse the xml in req.body.report', () => {
		const next = jest.fn()
		const req = { body: { report: 'AOjdoapiwjdoibqoudbwiaosjdaosho' } }
		const send = jest.fn()
		const res = {status: jest.fn(() => ({send}))}
		parseReport(req, res, next)
		expect(next).toBeCalledTimes(0)
		expect(send).toBeCalledTimes(1)
		expect(res.status).toBeCalledTimes(1)
		expect(res.status).toBeCalledWith(403)
		expect(send.mock.calls).toMatchSnapshot()
	})
})
