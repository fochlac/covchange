import { forge } from '../../utils/forge'
import initDb from '../../utils/fileDb'

class CommentDb implements Core.CommentDb {
	db: Core.FileDb
	ready: Promise<void>

	constructor() {
		this.ready = initDb('comments.json').then((db: Core.FileDb) => {
			this.db = db
		})
	}

	async get(repository: Core.Repository, pullRequestId: string): Promise<Core.Comment> {
		await this.ready
		const id = forge.pullRequestId({ pullRequestId, repository })
		return this.db.get(id)
	}

	async create(repository, pullRequestId, { commentId }): Promise<Core.Comment> {
		await this.ready
		const id = forge.pullRequestId({ pullRequestId, repository })

		await this.db.set(id, { id, commentId })
		return { id, commentId }
	}
}

export const commentDb = new CommentDb()
