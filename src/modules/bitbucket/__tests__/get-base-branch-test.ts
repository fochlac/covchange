import { Bitbucket } from '../bitbucket'
import { getBaseBranchFromPullrequest } from '../get-base-branch'

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

	const repository = {
		repo: 'name',
		project: 'slug',
		type: 'users',
	}
	const pr = {
		repository,
		name: '12345',
		report: null,
	}

	afterEach(() => {
		// @ts-ignore
		Bitbucket.get.mockClear()
	})

	it('should create a normal project type branch', () => {
		// @ts-ignore
		Bitbucket.get.mockImplementation(() => Promise.resolve({ toRef: toRef('NORMAL') }))
		return getBaseBranchFromPullrequest(pr).then(baseBranch => {
			expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/')
			expect(baseBranch).toMatchSnapshot()
		})
	})

	it('should create a normal project type branch', () => {
		// @ts-ignore
		Bitbucket.get.mockImplementation(() => Promise.resolve({ toRef: toRef('USER') }))
		return getBaseBranchFromPullrequest(pr).then(baseBranch => {
			expect(Bitbucket.get).toBeCalledWith('users/slug/repos/name/pull-requests/12345/')
			expect(baseBranch).toMatchSnapshot()
		})
	})
})
