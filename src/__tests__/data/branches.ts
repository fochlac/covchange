import { mockReport, mockReport2 } from './reports'

import { mockRepository as repository } from './repository'

const mockBranch = {
	name: 'base',
	reports: [mockReport, mockReport2],
	repository,
	id: '1',
	lastModified: 0,
}

const mockBranchRest = {
	name: 'base',
	report: mockReport,
	repository,
}

export { mockBranch, mockBranchRest }
