import '../../../__tests__/mock-config'

import { commentDb } from '../comments'
import initDb from '../../../utils/file-db'

jest.mock('../../../utils/logger')
jest.mock('../../../utils/file-db')

const repository = { project: 'slug', repo: 'name', type: 'users' }

const dbComment = { commentId: '123654', version: 0, id: 'users_slug_name_12345' }

describe('commentDb', () => {
	let fileDb

	beforeAll(async () => {
		fileDb = await initDb('comments.json')
	})

	afterEach(() => {
		fileDb.get.mockClear()
		fileDb.set.mockClear()
	})

	it('should call db.set with correct data on create and write report to disk', async () => {
		const branch = await commentDb.set(repository, '12345', { commentId: '123654', version: 0 })

		expect(branch).toMatchObject(dbComment)
		expect(fileDb.set).toBeCalledTimes(1)
		expect(fileDb.set).toBeCalledWith(dbComment.id, dbComment)
	})

	it('should call db.get when getting data and properly merge stored data with report', async () => {
		const branch = await commentDb.get(repository, '12345')

		expect(branch).toMatchObject(dbComment)
		expect(fileDb.get).toBeCalledTimes(1)
		expect(fileDb.get).toBeCalledWith(dbComment.id)
	})
})
