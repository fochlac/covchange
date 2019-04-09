import * as request from 'request-promise-native'

import { commentDb } from '../db/comments'
import { diffReports } from '../diff/diff'
import error from '../../utils/error'

const { internalError } = error('bitbucket comment:')

const Authorization = global.bitbucketKey
const baseUrl = ({ repository: { slug, name }, pullRequestId }: Core.PullRequest) =>
	`${global.bitbucket}/rest/api/1.0/${slug}/repos/${name}/pull-requests/${pullRequestId}/comments/`

const symbolsMap = {
	critical: ':u7981:',
	low: ':u6709:',
	medium: ':symbols:',
	high: ':u6307:',
}

const getSymbolFromCoverage = (metrics: Core.Metrics) => {
	const { statementCov, statements } = metrics
	const stringcode = statementCov > 85 ? 'high' : statementCov > 70 || statements <= 5 ? 'medium' : statementCov > 50 ? 'low' : 'critical'
	return symbolsMap[stringcode]
}

export function createComment(base: Core.Branch, pr: Core.PullRequest) {
	const diffLatest = diffReports(base.reports[0], pr.reports[0])

	return sendComment(pr, createCommentObject(diffLatest))
}

async function sendComment(pr, comment) {
	const existingComment = await commentDb.get(pr.repository, pr.pullRequestId)
	const uri = baseUrl(pr) + (existingComment ? existingComment.commentId : '')
	const method = existingComment ? 'PUT' : 'POST'

	return request({
		uri,
		method,
		json: true,
		headers: {
			Authorization,
		},
		body: comment,
	}).catch(internalError(2, 'Error posting comment.'))
}

function createCommentObject(diff: Core.DiffReport) {
	const totalDiff = diff.total.diff.statementCov
	const changedFilesHeader = (Object.keys(diff.changed).length && ['| File | Change | Coverage |', '|---|---|---|']) || []
	const deletedFilesHeader = (diff.deleted.length && ['##### Deleted files', '```diff']) || []
	const deletedFilesFooter = (diff.deleted.length && ['```']) || []

	const lines = [
		'### Coverage Statistics',
		`#### ${totalDiff <= 0 ? ':red_circle:' : ':large_blue_circle:'} This pull request will ` +
			`${totalDiff > 0 ? 'increase' : 'decrease'} total coverage by ${Math.abs(totalDiff)}% to ${diff.total.changed.statementCov}%.`,
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
	return `| ${name} | :sparkles: *new* | ${getSymbolFromCoverage(metrics)} ${metrics.statementCov}% |`
}

function deletedFileInfo(name: string) {
	return `- ${name}`
}

function changedFileInfo(name: string, diff: Core.Diff) {
	const covSymbol = diff.diff.statementCov < 0 ? ':red_circle:' : ':large_blue_circle:'
	return `| ${name} | ${covSymbol} ${diff.diff.statementCov}% | ${getSymbolFromCoverage(diff.changed)} ${diff.changed.statementCov}% |`
}
