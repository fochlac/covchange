declare namespace NodeJS {
	interface Global {
		port: number
		address: string
		logLevel: number
		appRoot: string
		storage: string
		bitbucket: string
	}
}

declare namespace Express {
	export interface Request {
		path: string
		params?: Params
		cookies?: {
			jwt?: string
		}
	}

	interface Params {
		[key: string]: any
	}

	export interface Response {
		cookie: (name: string, val: string, options: object) => Response
		set: (name: string, val: string) => Response
		headers: object
		status: Function
	}
}
