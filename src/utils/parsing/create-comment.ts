const svgBaseUrl = `http://${global.address}:${global.port}/svg`

const symbolsMap = {
	critical: `![critical](${svgBaseUrl}/critical.svg)`,
	low: `![warning](${svgBaseUrl}/warning.svg)`,
	medium: `![ok](${svgBaseUrl}/ok.svg)`,
	high: `![good](${svgBaseUrl}/good.svg)`,
	optimal: `![top](${svgBaseUrl}/top.svg)`,
}

export function createCommentObject(diff: Core.DiffReport, comment?: Core.Comment): Core.CommentRest {
	const totalDiff = diff.total.diff.statementCov
	const changedFilesHeader = (Object.keys(diff.changed).length && ['| Quality | File | Change | Coverage |', '|---|---|---|---|']) || []
	const deletedFilesHeader = (diff.deleted.length && ['##### Deleted files', '```diff']) || []
	const deletedFilesFooter = (diff.deleted.length && ['```']) || []
	const covSymbol = totalDiff < 0 ? `![decrease](${svgBaseUrl}/long-arrow-down.svg)` : `![improvement](${svgBaseUrl}/long-arrow-up.svg)`

	const lines = [
		'### Coverage Statistics',
		`#### ${covSymbol} This pull request will ${totalDiff > 0 ? 'decrease' : 'increase'}` +
			` total coverage by ${Math.abs(totalDiff)}% to ${diff.total.changed.statementCov}%.`,
		'',
		...changedFilesHeader,
		...Object.keys(diff.changed)
			.sort((a, b) => diff.changed[a].changed.statementCov - diff.changed[b].changed.statementCov)
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

	return { text: lines.join('\n'), version: comment && comment.version }
}

function newFileInfo(name: string, metrics: Core.Metrics) {
	return `| ${getSymbolFromCoverage(metrics)} | ${name} | ![new](${svgBaseUrl}/magic.svg) *new* | ${Math.round(metrics.statementCov)}% (${
		metrics.coveredStatements
	}/${metrics.statements}) |`
}

function deletedFileInfo(name: string) {
	return `- ${name}`
}

function changedFileInfo(name: string, { diff, changed, original }: Core.Diff) {
	const covSymbol =
		diff.statementCov < 0 ? `![decrease](${svgBaseUrl}/long-arrow-down.svg)` : `![improvement](${svgBaseUrl}/long-arrow-up.svg)`
	return (
		`| ${getSymbolFromCoverage(changed)} | ${name} | ${covSymbol} ${Math.round(diff.statementCov)}% (${original.coveredStatements} ` +
		`:arrow_right:  ${changed.coveredStatements}) | ${Math.round(changed.statementCov)}% (${changed.coveredStatements}/${
			changed.statements
		}) |`
	)
}

const getSymbolFromCoverage = (metrics: Core.Metrics) => {
	const { statementCov, statements, conditionalCov, conditionals } = metrics
	let stringcode = 'critical'
	if (statementCov >= 90 && (conditionalCov > 75 || conditionals === 0)) {
		stringcode = 'optimal'
	} else if (statementCov >= 80 && (conditionalCov > 50 || conditionals <= 1)) {
		stringcode = 'high'
	} else if (statementCov >= 70 || statements <= 5) {
		stringcode = 'medium'
	} else if (statementCov > 50) {
		stringcode = 'low'
	}

	return symbolsMap[stringcode]
}
