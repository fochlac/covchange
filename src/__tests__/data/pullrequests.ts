import { mockReport, mockReport2 } from './reports'

import { mockRepository as repository } from './repository'

const mockPullRequestRest = {
	repository,
	name: '12345',
	report: mockReport,
}

const mockPullRequest = {
	reports: [mockReport, mockReport2],
	repository,
	name: '12345',
	id: '1',
	lastModified: 0,
	base: {
		name: 'base',
		repository,
	},
}

export { mockPullRequestRest, mockPullRequest }
