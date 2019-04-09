import { outputFile as outputFileRaw, readJSON as readJSONRaw } from 'fs-extra'

import { forge } from '../../utils/forge'
import initDb from '../../utils/fileDb'

const writeDiffs = (id, data) =>
	outputFileRaw(global.storage + `pullRequests/pullRequest_${id}.json`, typeof data !== 'string' ? JSON.stringify(data) : data, 'utf8')
const readDiffs = id => readJSONRaw(global.storage + `pullRequests/pullRequest_${id}.json`, 'utf8')

class PullRequestDb implements Core.PullRequestDb {
	db: Core.FileDb
	ready: Promise<void>

	constructor() {
		this.ready = initDb('pullRequests.json').then((db: Core.FileDb) => {
			this.db = db
		})
		this.get = this.get.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}

	async exists(repository: Core.Repository, pullRequestId: string): Promise<boolean> {
		await this.ready
		const id = forge.pullRequestId({ repository, pullRequestId })
		return !!this.db.get(id)
	}

	async get(repository: Core.Repository, pullRequestId: string): Promise<Core.PullRequest> {
		await this.ready
		const id = forge.pullRequestId({ repository, pullRequestId })
		const pullRequest = this.db.get(id)
		if (pullRequest) {
			const reports = await readDiffs(id)
			return { ...pullRequest, reports }
		}
		return null
	}

	async update({ pullRequestId, repository, report }: Core.PullRequestRest): Promise<Core.PullRequest> {
		await this.ready
		if (!(await this.exists(repository, pullRequestId))) return Promise.reject('PullRequest does not exist')
		const id = forge.pullRequestId({ repository, pullRequestId })
		const reports = (await readDiffs(id)).filter(({ timestamp }) => timestamp !== report.timestamp)
		const pullRequest = this.db.get(id)
		pullRequest.lastModified = Date.now()
		await Promise.all([writeDiffs(id, [report, ...reports]), this.db.set(id, pullRequest)])
		pullRequest.reports = [report, ...reports]

		return pullRequest
	}

	async create({ pullRequestId, repository, report, base }: Core.PullRequestRest): Promise<Core.PullRequest> {
		await this.ready
		if (await this.exists(repository, pullRequestId)) return Promise.reject('PullRequest already exists')
		const id = forge.pullRequestId({ repository, pullRequestId })
		const pullRequest = {
			id,
			pullRequestId,
			repository,
			base,
			lastModified: Date.now(),
		} as Core.PullRequest
		await Promise.all([writeDiffs(id, [report]), this.db.set(id, pullRequest)])
		pullRequest.reports = [report]
		return pullRequest
	}
}

export const pullRequestDb = new PullRequestDb()
