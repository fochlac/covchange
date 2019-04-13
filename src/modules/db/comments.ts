import { forge } from '../../utils/forge'
import initDb from '../../utils/file-db'

class CommentDb implements Core.CommentDb {
	db: Core.FileDb
	ready: Promise<void>

	constructor() {
		this.ready = initDb('comments.json').then((db: Core.FileDb) => {
			this.db = db
		})
	}

	async get(repository: Core.Repository, name: string): Promise<Core.Comment> {
		await this.ready
		const id = forge.pullRequestId({ name, repository })
		return this.db.get(id)
	}

	async set(repository, name, { commentId, version }): Promise<Core.Comment> {
		await this.ready
		const id = forge.pullRequestId({ name, repository })

		await this.db.set(id, { id, commentId, version })
		return { id, commentId, version }
	}
}

export const commentDb = new CommentDb()
