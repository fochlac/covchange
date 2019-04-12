import { parse } from 'fast-xml-parser'

const config = {
	ignoreAttributes: false,
	attrNodeName: 'attr',
	attributeNamePrefix: '',
	parseAttributeValue: true,
}

/**
 * Function to parse a raw clover coverage report in xml format
 *
 * @param {string} rawXML coverage report as utf8 string
 * @returns {Core.Report} parsed coverage report
 */
export function createReportFromXML(rawXML: string): Core.Report {
	const rawProject = parse(rawXML, config).coverage.project

	const folders = rawProject.metrics.package.reduce(reduceFolder, {})
	const files = Object.values(folders).reduce(reduceFiles, {})

	return {
		timestamp: rawProject.attr.timestamp,
		metrics: parseMetrics(rawProject.metrics.attr),
		folders,
		files,
	}
}

function reduceFolder(folders, folder) {
	folders[folder.attr.name] = {
		name: folder.attr.name,
		metrics: parseMetrics(folder.metrics.attr),
		files: parseFile(folder.file),
	}
	return folders
}

function reduceFiles(files, folder) {
	folder.files.forEach(file => {
		files[`${folder.name.split('.').join('/')}/${file.name}`] = file
	})
	return files
}

function parseFile(file) {
	const rawFiles = file && file.length ? file : file ? [file] : []

	return rawFiles.map(file => ({
		name: file.attr.name,
		metrics: parseMetrics(file.metrics.attr),
	}))
}

function parseMetrics({ statements, coveredstatements, conditionals, coveredconditionals }) {
	return {
		statements,
		conditionals,
		coveredStatements: coveredstatements,
		coveredConditionals: coveredconditionals,
		statementCov: (statements && Math.round((coveredstatements / statements) * 10000)) / 100 || 0,
		conditionalCov: (conditionals && Math.round((coveredconditionals / conditionals) * 10000)) / 100 || 0,
	}
}
