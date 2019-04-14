import { createWriteStream, existsSync, mkdirSync } from 'fs'

/**
 *   Log Levels:
 *   0: no error, very important info
 *   1: error: critical error in app
 *   2: error: internal error in app
 *   3: error: minor error
 *
 *   4: info: important info (bad request/login)
 *   5: info: minor info
 *
 *   6: trace: tracing informations
 *   7: unimportant tracing information
 *
 *  10: full trace: (requests objects, etc)
 *
 **/
let currentDate = getDate().day
if (!existsSync(global.appRoot + 'log')) {
	mkdirSync(global.appRoot + 'log')
}

let logStream = createWriteStream(global.appRoot + 'log/output' + getDate().day + '.txt', {
	flags: 'a',
	encoding: 'utf8',
	autoClose: true,
})

logStream.on('error', err => {
	console.log(err)
})

export default (level: number, ...message: any[]): void => {
	const now = getDate()
	const messages = message.map(parseMessage).join(' ')
	const logMessage = `${now.day} - ${now.time} - ${level} - ${messages}`

	if (level <= global.logLevel) {
		console.log(logMessage)
	}

	if (currentDate !== getDate().day) {
		currentDate = getDate().day
		logStream.end()
		logStream = createWriteStream(global.appRoot + 'log/output' + getDate().day + '.txt', {
			flags: 'a',
			encoding: 'utf8',
			autoClose: true,
		})
	}

	logStream.write(logMessage)
}

function parseMessage(item) {
	let output
	if (['string', 'number', 'boolean'].includes(typeof item)) {
		output = item
	} else {
		try {
			if (Object.prototype.toString.call(item) === '[object Error]') {
				output = '\n' + item.stack.toString()
			} else {
				output = '\n' + JSON.stringify(item)
			}
		} catch (err) {
			console.log(err + '\n' + item)
			output = ''
		}
	}
	return output
}

function getDate() {
	const date = new Date()
	return {
		day: date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate(),
		time: date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(),
	}
}
