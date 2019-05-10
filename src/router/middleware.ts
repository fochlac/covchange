import { createReportFromXML } from '../utils/parsing/parse-report'
import error from '../utils/error';

const { badRequest } = error('parseReport:')

export const parseReport = (req, res, next) => {
	try {
		req.body.report = createReportFromXML(req.body.report)
		next()
	}
	catch(err) {
		badRequest(3, res, 'report', 'Invalid XML or wrong structure.')(err)
	}
}
