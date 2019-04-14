import { parseReport } from '../middleware'
import { reportRaw } from '../../__tests__/data/reports'

describe('middleware', () => {
	it('parseReport > should parse the xml in req.body.report', () => {
		const next = jest.fn()
		const req = { body: { report: reportRaw } }
		parseReport(req, null, next)
		expect(next).toBeCalledTimes(1)
		expect(req.body.report).toMatchSnapshot()
	})
})
