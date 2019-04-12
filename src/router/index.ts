import { addBranchReport, addPullRequestReport } from './controllers'
import { branch, pullRequestId, report, repository } from './validators'

import { createRouter } from 'abstract-express-router'
import { join } from 'path'
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
		logLevel: 3,
	},
)
