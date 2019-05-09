declare namespace Core {
	interface Global extends NodeJS.Global {}

	interface ErrorConstructor {
		routerError: (level: number, res: Express.Response, ...message: Array<any>) => (error: any) => void
		internalError: (level: number, ...message: Array<any>) => (error: any) => void
	}

	type Path = string
	type Id = string
	type Timestamp = number

	interface ObjectMap {
		[key: string]: any
	}

	class FileDb {
		set: (id: Id, value: any) => Promise<any>
		setMultiple: (update: ObjectMap) => Promise<{ [id: string]: any }>
		nextIndex: Id
		delete: (id: Id) => Promise<Id>
		list: () => any[]
		get: (id: Id) => any
		find: (key: string, value: any) => any[]
	}

	class BranchDb {
		db: FileDb
		ready: Promise<void>
		exists: (repository: Repository, name: string) => Promise<boolean>
		get: (repository: Repository, name: string) => Promise<Branch>
		create: (rawBranch: BranchRest) => Promise<Branch>
	}

	class CommentDb {
		db: FileDb
		ready: Promise<void>
		get: (repository: Repository, name: string) => Promise<Comment>
		set: (repository: Repository, name: string, comment: Comment) => Promise<Comment>
	}

	class PullRequestDb {
		db: FileDb
		ready: Promise<void>
		exists: (repository: Repository, name: string) => Promise<boolean>
		get: (repository: Repository, name: string) => Promise<PullRequest>
		create: (rawPullRequest: PullRequestRest, base: BaseBranch) => Promise<PullRequest>
	}

	interface Comment {
		id: Id
		commentId: Id
		version: number
		taskId?: Id
	}

	interface CommentRest {
		text: string
		version?: number
	}

	interface BranchRest {
		name: string
		repository: Repository
		report: Report
	}

	interface BaseBranch {
		name: string
		repository: Repository
	}

	interface Repository {
		repo: string
		project: string
		type: string
	}

	interface PullRequestRest {
		name: string
		repository: Repository
		report: Report
		task: boolean
		lcov?: string
	}

	interface Branch {
		name: string
		repository: Repository
		id: Id
		lastModified: Timestamp
		reports?: Report[]
	}

	interface PullRequest {
		name: string
		repository: Repository
		base: BaseBranch
		id: Id
		lastModified: Timestamp
		task: boolean
		lcov?: string
		reports?: Report[]
	}

	interface Report {
		metrics: Metrics
		timestamp: Timestamp
		folders: { [key: string]: Folder }
		files: { [key: string]: File }
	}

	interface Folder {
		name: string
		metrics: Metrics
		files: File[]
	}

	interface File {
		name: string
		metrics: Metrics
	}

	interface Metrics {
		conditionals: number
		statements: number
		coveredStatements: number
		coveredConditionals: number
		statementCov: number
		conditionalCov: number
	}

	interface DiffReport {
		total: Diff
		new: { [path: string]: Metrics }
		changed: { [path: string]: Diff }
		deleted: string[]
	}

	interface Diff {
		original: Metrics
		changed: Metrics
		diff: Metrics
	}
}
