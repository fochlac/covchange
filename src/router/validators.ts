import { validate as isValidXML } from 'fast-xml-parser'

export const branch = /^[^\s]{5,250}$/
export const repository = (repository) => {
	return repository && /^[^\s]{5,250}$/.test(repository.repo) && /^(users|projects)$/.test(repository.type) && /^[a-zA-Z-_]{5,250}$/.test(repository.project)
}
export const pullRequestId = /^[\n]{5,10}$/
export const report = input => {
	return !!input && isValidXML(input, {})
}
