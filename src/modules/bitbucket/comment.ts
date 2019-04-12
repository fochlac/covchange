import { Bitbucket } from './bitbucket'
import { commentDb } from '../db/comments'
import { diffReports } from '../diff/diff'

const svgBaseUrl = `http://${global.address}:${global.port}/svg`

function createApiSlug({ repository: { type, repo, project }, name }: Core.PullRequest, commentId?: number) {
	return `${type}/${repo}/repos/${project}/pull-requests/${name}/comments/${commentId || ''}`
}

export async function submitResults(base: Core.Branch, pr: Core.PullRequest) {
	const diff = diffReports(base.reports[0], pr.reports[0])
	const comment = createCommentObject(diff)
	const existingComment = await commentDb.get(pr.repository, pr.name)

	return existingComment ? updateComment(comment, existingComment, pr) : createComment(comment, pr)
}

function updateComment(comment, existingComment, pr) {
	return Bitbucket.put(createApiSlug(pr, existingComment.commentId), comment)
}

function createComment(comment, pr) {
	return Bitbucket.post(createApiSlug(pr), comment)
}

const symbolsMap = {
	critical: `![critical](${svgBaseUrl}/close-round.svg)`,
	low: `![warning](${svgBaseUrl}/exclamation-triangle.svg)`,
	medium: ':ok:',
	high: `![good](${svgBaseUrl}/check-mark-circle.svg)`,
	optimal: ':100:',
}

const getSymbolFromCoverage = (metrics: Core.Metrics) => {
	const { statementCov, statements, conditionalCov } = metrics
	let stringcode = 'critical'
	if (statementCov >= 90 && conditionalCov > 80) {
		stringcode = 'optimal'
	} else if (statementCov >= 80 && conditionalCov > 70) {
		stringcode = 'high'
	} else if (statementCov >= 70 || statements <= 5) {
		stringcode = 'medium'
	} else if (statementCov > 50) {
		stringcode = 'low'
	}

	return symbolsMap[stringcode]
}

function createCommentObject(diff: Core.DiffReport) {
	const totalDiff = diff.total.diff.statementCov
	const changedFilesHeader = (Object.keys(diff.changed).length && ['| Quality | File | Change | Coverage |', '|---|---|---|---|']) || []
	const deletedFilesHeader = (diff.deleted.length && ['##### Deleted files', '```diff']) || []
	const deletedFilesFooter = (diff.deleted.length && ['```']) || []
	const covSymbol = totalDiff < 0 ? `![decrease](${svgBaseUrl}/long-arrow-down.svg)` : `![improvement](${svgBaseUrl}/long-arrow-up.svg)`

	const lines = [
		'### Coverage Statistics',
		`#### ${covSymbol} This pull request will ${totalDiff > 0 ? 'increase' : 'decrease'}` +
			` total coverage by ${Math.abs(totalDiff)}% to ${diff.total.changed.statementCov}%.`,
		'',
		...changedFilesHeader,
		...Object.keys(diff.changed)
			.sort((a, b) => diff.changed[a].diff.statementCov - diff.changed[b].diff.statementCov)
			.slice(0, 10)
			.map(name => changedFileInfo(name, diff.changed[name])),
		...Object.keys(diff.new)
			.sort((a, b) => diff.new[a].statementCov - diff.new[b].statementCov)
			.slice(0, 10)
			.map(name => newFileInfo(name, diff.new[name])),
		...deletedFilesHeader,
		...diff.deleted.map(deletedFileInfo),
		...deletedFilesFooter,
	]

	return { text: lines.join('\n') }
}

function newFileInfo(name: string, metrics: Core.Metrics) {
	return `| ${getSymbolFromCoverage(metrics)} | ${name} | ![new](${svgBaseUrl}/magic.svg) *new* | ${metrics.statementCov}% |`
}

function deletedFileInfo(name: string) {
	return `- ${name}`
}

function changedFileInfo(name: string, { diff, changed }: Core.Diff) {
	const covSymbol =
		diff.statementCov < 0 ? `![decrease](${svgBaseUrl}/long-arrow-down.svg)` : `![improvement](${svgBaseUrl}/long-arrow-up.svg)`
	const { statements, statementCov } = changed
	const changedLineCov = Math.round((statements * statementCov) / 100)
	const origLineCov = changedLineCov - diff.statements
	return (
		`| ${getSymbolFromCoverage(changed)} | ${name} | ${covSymbol} ${diff.statementCov}% (${origLineCov} ` +
		`:arrow_right:  ${changedLineCov}) | ${statementCov}% (${changedLineCov}/${statements}) |`
	)
}
