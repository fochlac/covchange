import { addBranchReport, addPullRequestReport } from './controllers'
import { boolean, branch, pullRequestId, report, repository, url } from './validators'

import { createRouter } from 'abstract-express-router'
import { join } from 'path'
import logger from '../utils/logger'
import { parseReport } from './middleware'

export const router = createRouter(
	{
		api: {
			middleware: [],
			branch: {
				post: {
					body: { name: branch, report, repository },
					middleware: [parseReport],
					controller: addBranchReport,
				},
			},
			pullrequest: {
				post: {
					body: {
						name: pullRequestId,
						report,
						repository,
						lcov: url,
						task: boolean
					},
					middleware: [parseReport],
					controller: addPullRequestReport,
				},
			},
		},
		svg: {
			static: join(__dirname, '../../svg/'),
		},
	},
	{
		logger: ({ level, message }) => logger(Math.floor(level * 2), ' - router - ', message),
		bodyParserOptions: { limit: '50mb'}
	},
)
