import { validate as isValidXML } from 'fast-xml-parser'
import { regexpValidator } from 'abstract-express-router';

export const branch = regexpValidator(/^[^\s]{1,250}$/)
export const repository = {
	repo: regexpValidator(/^[^\s]{1,250}$/),
	type: regexpValidator(/^(users|projects)$/),
	project: regexpValidator(/^[a-zA-Z-_]{1,250}$/),
}
export const pullRequestId = regexpValidator(/^[\d]{1,10}$/)
export const url = regexpValidator(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, true)
export const boolean = regexpValidator(/^(true|1|0|false|TRUE|FALSE)$/, true)

export const report = input => {
	return !!input && isValidXML(input, {}) === true
}
