export function diffReports(original: Core.Report, changed: Core.Report): Core.DiffReport {
	const deletedFiles = Object.keys(original.files).filter(name => !changed.files[name])
	const changedFiles = Object.keys(original.files).filter(name => {
		const altered = changed.files[name] && changed.files[name].metrics
		const orig = original.files[name].metrics
		if (!altered) {
			return false
		}

		return (
			altered &&
			(altered.statements !== orig.statements ||
				altered.conditionalCov !== orig.conditionalCov ||
				altered.statementCov !== orig.statementCov ||
				altered.conditionals !== orig.conditionals)
		)
	})
	const newFiles = Object.keys(changed.files).filter(name => !original.files[name])

	return {
		total: diffMetrics(original.metrics, changed.metrics),
		deleted: deletedFiles,
		changed: changedFiles.reduce((files, name) => {
			files[name] = diffMetrics(original.files[name].metrics, changed.files[name].metrics)
			return files
		}, {}),
		new: newFiles.reduce((files, name) => {
			files[name] = changed.files[name].metrics
			return files
		}, {}),
	}
}

function diffMetrics(original: Core.Metrics, changed: Core.Metrics): Core.Diff {
	return {
		original,
		changed,
		diff: {
			statements: Math.floor((changed.statements - original.statements) * 10) / 10,
			conditionals: Math.floor((changed.conditionals - original.conditionals) * 10) / 10,
			statementCov: Math.floor((changed.statementCov - original.statementCov) * 10) / 10,
			conditionalCov: Math.floor((changed.conditionalCov - original.conditionalCov) * 10) / 10,
		},
	}
}
