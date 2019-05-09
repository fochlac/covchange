import { openTask, resolveTask } from '../tasks';

import { Bitbucket } from '../bitbucket'

jest.mock('../../../utils/logger')
jest.mock('../bitbucket', () => ({
	Bitbucket: {
		put: jest.fn(() => Promise.resolve({ id: 42, version: 1 })),
		post: jest.fn(() => Promise.resolve({ id: 23, version: 1 })),
	},
}))

const testcomment = { commentId: 'commentId' }
const testcommentWithTask = { commentId: 'commentId', taskId: '12' }

describe('task', () => {

	afterEach(() => {
		// @ts-ignore
		Bitbucket.put.mockClear()
		// @ts-ignore
		Bitbucket.post.mockClear()
	})

	it('should create a task', async () => {
		expect(await openTask(testcomment)).toEqual('23')
		expect(Bitbucket.put).toBeCalledTimes(0)
		expect(Bitbucket.post).toBeCalledTimes(1)
		// @ts-ignore
		expect(Bitbucket.post.mock.calls).toMatchSnapshot()
	})

	it('should update existing task to open', async () => {
		expect(await openTask(testcommentWithTask)).toEqual('42')
		expect(Bitbucket.put).toBeCalledTimes(1)
		expect(Bitbucket.post).toBeCalledTimes(0)
		// @ts-ignore
		expect(Bitbucket.put.mock.calls).toMatchSnapshot()
	})

	it('should update existing task to resolved', async () => {
		expect(await resolveTask(testcommentWithTask)).toEqual('42')
		expect(Bitbucket.put).toBeCalledTimes(1)
		expect(Bitbucket.post).toBeCalledTimes(0)
		// @ts-ignore
		expect(Bitbucket.put.mock.calls).toMatchSnapshot()
	})

	it('should do nothing', async () => {
		expect(await resolveTask(testcomment)).toBeUndefined()
		expect(Bitbucket.put).toBeCalledTimes(0)
		expect(Bitbucket.post).toBeCalledTimes(0)
	})
})
