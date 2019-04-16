const svgBaseUrl = `http://${global.address}:${global.port}/svg`

const symbolsMap = {
	critical: `![critical](${svgBaseUrl}/critical.svg)`,
	low: `![warning](${svgBaseUrl}/warning.svg)`,
	medium: `![ok](${svgBaseUrl}/ok.svg)`,
	high: `![good](${svgBaseUrl}/good.svg)`,
	optimal: `![top](${svgBaseUrl}/top.svg)`,
	decrease: `![decrease](${svgBaseUrl}/arrow-down.svg)`,
	increase: `![improvement](${svgBaseUrl}/arrow-up.svg)`,
	new: `![new](${svgBaseUrl}/new.svg)`,
}

export function createCommentObject(diff: Core.DiffReport, comment?: Core.Comment): Core.CommentRest {
	const totalDiff = diff.total.diff.statementCov
	const changedFilesHeader = (Object.keys(diff.changed).length && ['| Quality | File | Change | Coverage |', '|---|---|---|---|']) || []
	const deletedFiles = diff.deleted.length ? ['##### Deleted files', '```diff', ...diff.deleted.map(name => `- ${name}`), '```'] : []
	const covSymbol = totalDiff < 0 ? symbolsMap.decrease : symbolsMap.increase
	const summedMetrics = Object.values(diff.changed)
		.map(diff => diff.changed)
		.concat(Object.values(diff.new))
		.reduce(
			(sum, metric) => ({
				coveredStatements: sum.coveredStatements + metric.coveredStatements,
				statements: sum.statements + metric.statements,
			}),
			{ coveredStatements: 0, statements: 0 },
		)
	const diffCoverage = Math.round((summedMetrics.coveredStatements / summedMetrics.statements) * 100)

	const lines = [
		'### Coverage Statistics',
		`#### ${covSymbol} This pull request has a diff coverage of ${diffCoverage}% and will ${totalDiff < 0 ? 'decrease' : 'increase'}` +
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
	const diffPercentage = `${statementCov < 0 ? '-' : '+'}${Math.abs(Math.round(statementCov))}%`
	const diffCell = `${covSymbol} ${diffPercentage} (${original.coveredStatements} :arrow_right: ${coveredStatements})`
	const newCoverageCell = `${Math.round(changed.statementCov)}% (${coveredStatements}/${changed.statements})`

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
