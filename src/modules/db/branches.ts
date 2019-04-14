import { outputFile, readJSON } from 'fs-extra'

import { forge } from '../../utils/forge'
import initDb from '../../utils/file-db'

const writeDiffs = (id, data) => outputFile(global.storage + `branches/branch_${id}.json`, JSON.stringify(data), 'utf8')
const readDiffs = id => readJSON(global.storage + `branches/branch_${id}.json`, 'utf8')

class BranchDb implements Core.BranchDb {
	db: Core.FileDb
	ready: Promise<void>

	constructor() {
		this.ready = initDb('branches.json').then((db: Core.FileDb) => {
			this.db = db
		})
		this.get = this.get.bind(this)
		this.create = this.create.bind(this)
		this.update = this.update.bind(this)
	}

	async exists(repository: Core.Repository, name: string): Promise<boolean> {
		await this.ready
		const id = forge.branchId({ repository, name })
		return !!this.db.get(id)
	}

	async get(repository: Core.Repository, name: string): Promise<Core.Branch> {
		await this.ready
		const id = forge.branchId({ repository, name })
		const branch = this.db.get(id)
		if (branch) {
			const reports = await readDiffs(id)
			return { ...branch, reports }
		}
		return null
	}

	async update(branchRest: Core.BranchRest): Promise<Core.Branch> {
		await this.ready
		if (!(await this.exists(branchRest.repository, branchRest.name))) return Promise.reject('Branch does not exist')
		const id = forge.branchId(branchRest)
		const reports = (await readDiffs(id)).filter(({ timestamp }) => timestamp !== branchRest.report.timestamp)
		const branch = this.db.get(id)
		branch.lastModified = Date.now()
		await Promise.all([writeDiffs(id, [branchRest.report, ...reports]), this.db.set(id, branch)])

		return { ...branch, reports: [branchRest.report, ...reports] }
	}

	async create(branchRest: Core.BranchRest): Promise<Core.Branch> {
		await this.ready
		if (await this.exists(branchRest.repository, branchRest.name)) return Promise.reject('Branch already exists')
		const id = forge.branchId(branchRest)
		const branch = {
			repository: branchRest.repository,
			name: branchRest.name,
			id,
			lastModified: Date.now(),
		} as Core.Branch
		await Promise.all([writeDiffs(id, [branchRest.report]), this.db.set(id, branch)])
		return { ...branch, reports: [branchRest.report] }
	}
}

export const branchDb = new BranchDb()
