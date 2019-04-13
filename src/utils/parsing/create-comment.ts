const svgBaseUrl = `http://${global.address}:${global.port}/svg`

const symbolsMap = {
	critical: `![critical](${svgBaseUrl}/critical.svg)`,
	low: `![warning](${svgBaseUrl}/warning.svg)`,
	medium: `![ok](${svgBaseUrl}/ok.svg)`,
	high: `![good](${svgBaseUrl}/good.svg)`,
	optimal: `![top](${svgBaseUrl}/top.svg)`,
	decrease: `![decrease](${svgBaseUrl}/long-arrow-down.svg)`,
	increase: `![improvement](${svgBaseUrl}/long-arrow-up.svg)`,
	new: `![new](${svgBaseUrl}/magic.svg)`,
}

export function createCommentObject(diff: Core.DiffReport, comment?: Core.Comment): Core.CommentRest {
	const totalDiff = diff.total.diff.statementCov
	const changedFilesHeader = (Object.keys(diff.changed).length && ['| Quality | File | Change | Coverage |', '|---|---|---|---|']) || []
	const deletedFiles = diff.deleted.length ? ['##### Deleted files', '```diff', ...diff.deleted.map(name => `- ${name}`), '```'] : []
	const covSymbol = totalDiff < 0 ? symbolsMap.decrease : symbolsMap.increase

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
		...deletedFiles,
	]

	return { text: lines.join('\n'), version: comment && comment.version }
}

function newFileInfo(name: string, metrics: Core.Metrics) {
	const newCoverageCell = `${Math.round(metrics.statementCov)}% (${metrics.coveredStatements}/${metrics.statements})`

	return `| ${getSymbolFromCoverage(metrics)} | ${name} | ${symbolsMap.new} *new* | ${newCoverageCell} |`
}

function changedFileInfo(name: string, { diff: { statementCov }, changed, changed: { coveredStatements }, original }: Core.Diff) {
	const covSymbol = statementCov < 0 ? symbolsMap.decrease : symbolsMap.increase
	const diffCell = `${covSymbol} ${Math.round(statementCov)}% (${original.coveredStatements}:arrow_right:${coveredStatements})`
	const newCoverageCell = `${Math.round(statementCov)}% (${coveredStatements}/${changed.statements})`

	return `| ${getSymbolFromCoverage(changed)} | ${name} | ${diffCell} | ${newCoverageCell} |`
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
