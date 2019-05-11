import { toBoolean } from '../parse-input';

describe('parse input', () => {
	it('should properly parse a boolean', () => {
		expect(toBoolean(1)).toBeTruthy()
		expect(toBoolean(true)).toBeTruthy()
		expect(toBoolean('1')).toBeTruthy()
		expect(toBoolean('true')).toBeTruthy()
		expect(toBoolean('TRUE')).toBeTruthy()
		expect(toBoolean(0)).toBeFalsy()
		expect(toBoolean('0')).toBeFalsy()
		expect(toBoolean('false')).toBeFalsy()
		expect(toBoolean(false)).toBeFalsy()
		expect(toBoolean('FALSE')).toBeFalsy()
	})
})
