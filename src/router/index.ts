import { addBranchReport, addPullRequestReport, getPullrequest } from './controllers'
import { branch, pullRequestId, report, repository } from './validators'

import { createRouter } from 'abstract-express-router'
import { parseReport } from './middleware'

export const router = createRouter(
	{
		api: {
			middleware: [],
			branches: {
				post: {
					body: { name: branch, report, repository },
					middleware: [parseReport],
					controller: addBranchReport,
				},
			},
			pullrequests: {
				post: {
					body: {
						pullRequestId,
						report,
						repository,
					},
					middleware: [parseReport],
					controller: addPullRequestReport,
				},
			}
		},
	},
	{
		logLevel: 3,
	},
)
