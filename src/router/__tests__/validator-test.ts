import { report } from '../validators'
import { reportRaw } from '../../__tests__/data/reports'

describe('validators', () => {
	it('report > should test for valid xml', () => {
		// @ts-ignore
		expect(report()).toBeFalsy()
		expect(report('test123')).toBeFalsy()
		expect(report(reportRaw)).toBeTruthy()
	})
})
