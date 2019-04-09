import { validate as isValidXML } from 'fast-xml-parser'

export const branch = /[^\s]{5,250}/
export const repository = {
	name: /[^\s]{5,250}/,
	slug: /(users|projects)\/[^a-zA-Z-_]{5,250}/,
}
export const pullRequestId = /[\n]{5,10}/
export const report = input => {
	return !!input && isValidXML(input, {})
}
