import { validate as isValidXML } from 'fast-xml-parser'

export const branch = /^[^\s]{5,250}$/
export const repository = {
	repo: /^[^\s]{5,250}$/,
	type: /^(users|projects)$/,
	project: /^[a-zA-Z-_]{5,250}$/,
}
export const pullRequestId = /^[\n]{5,10}$/
export const url = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
// @ts-ignore
url.allowUndefined = true

export const report = input => {
	return !!input && isValidXML(input, {}) === true
}
