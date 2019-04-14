import { Bitbucket } from '../bitbucket'
import { getBaseBranchFromPullrequest } from '../get-base-branch'
import { mockPullRequestRest } from '../../../__tests__/data/pullrequests'

jest.mock('../../../utils/logger.ts', () => () => null)
jest.mock('../bitbucket', () => ({
	Bitbucket: {
		get: jest.fn(),
	},
}))

describe('get-base-branch', () => {
	const toRef = type => ({
		displayId: 'name',
		repository: { slug: 'repo', project: { key: 'project', type } },
	})

	afterEach(() => {
		// @ts-ignore
		Bitbucket.get.mockClear()
	})

	it('should create a normal project type branch', async () => {
		// @ts-ignore
		Bitbucket.get.mockImplementation(() => Promise.resolve({ toRef: toRef('NORMAL') }))
		const baseBranch = await getBaseBranchFromPullrequest(mockPullRequestRest)
		expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/')
		expect(baseBranch).toMatchSnapshot()
	})

	it('should create a normal project type branch', async () => {
		// @ts-ignore
		Bitbucket.get.mockImplementation(() => Promise.resolve({ toRef: toRef('USER') }))
		const baseBranch = await getBaseBranchFromPullrequest(mockPullRequestRest)
		expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/')
		expect(baseBranch).toMatchSnapshot()
	})
})
