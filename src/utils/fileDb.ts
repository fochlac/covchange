const clone = require('clone')

import { moveSync as moveSyncRaw, outputFile as outputFileRaw, pathExists as pathExistsRaw, readJSON as readJSONRaw } from 'fs-extra'

import error from './error'
import logger from './logger'

const log = (level, ...message) => logger(level, 'fileDb -', ...message)
const { internalError } = error('fileDb')
const outputFile = (path, data, options) => outputFileRaw(global.storage + path, data, options)
const pathExists = path => pathExistsRaw(global.storage + path)
const readJSON = (path, options) => readJSONRaw(global.storage + path, options)
const moveSync = (path, path2) => moveSyncRaw(global.storage + path, global.storage + path2)

class FileDb {
	content: object
	path: string
	highestIndex: number
	constructor(path, initialState) {
		this.content = initialState
		this.path = path
		this.highestIndex = Object.keys(initialState).length ? Math.max(...Object.keys(initialState).map(key => +key)) : 0
	}

	list() {
		log(8, `listed all elements from db ${this.path}`)
		return clone(Object.values(this.content)) as any[]
	}

	get(id: Core.Id) {
		log(8, `read element ${id} from db ${this.path}`)
		return clone(this.content[id])
	}

	find(key: string, value: string) {
		log(8, `searched for ${value} in column ${key} from db ${this.path}`)
		return clone(Object.values(this.content).filter(elem => elem[key] === value)) as any[]
	}

	async set(id, value) {
		this.content[id] = clone(value)
		await write(this.content, this.path)
		log(8, `updated element ${id} from db ${this.path}`)
		return clone(value)
	}

	async setMultiple(map) {
		this.content = {
			...this.content,
			...clone(map),
		}
		await write(this.content, this.path)
		log(8, `updated elements ${Object.keys(map).join(', ')} from db ${this.path}`)
		return clone(map)
	}

	get nextIndex(): Core.Id {
		this.highestIndex++
		return this.highestIndex.toString()
	}

	async delete(id: Core.Id) {
		delete this.content[id]
		await write(this.content, this.path)
		log(8, `deleted element ${id} from db ${this.path}`)
		return id
	}
}

let writeDebounce
let debounceContent
function write(content: object, path: Core.Path): void {
	if (writeDebounce) {
		debounceContent = content
	} else {
		debounceContent = content
		writeDebounce = new Promise(resolve =>
			setTimeout(async () => {
				const data = JSON.stringify(debounceContent, null, 2)
				debounceContent = undefined
				writeDebounce = undefined
				await outputFile(path, data, 'utf8')
				resolve()
			}, 50),
		)
	}
	return writeDebounce
}

export default async function initDb(path: Core.Path, initialState: object = {}): Promise<FileDb> {
	if (await pathExists(path)) {
		try {
			initialState = await readJSON(path, 'utf8')
		} catch (error) {
			internalError(1, 'error opening the stored db')(error)
			moveSync(path, path.split('.')[0] + '_backup_' + Date.now() + '.json')
		}
	}
	return new FileDb(path, initialState || {})
}
