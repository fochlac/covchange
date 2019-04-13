import { createReportFromXML } from '../utils/parsing/parse-report'

export const parseReport = (req, res, next) => {
	req.body.report = createReportFromXML(req.body.report)
	next()
}
