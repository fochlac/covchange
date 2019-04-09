import logger from './logger'

const log = (level, ...message) => logger(level, 'error -', ...message)

const error = (location: string): Core.ErrorConstructor => ({
	internalError: (level: number, ...message: Array<any>) => (detail: Error): void => {
		log(level, location, ...message, detail)
	},
	routerError: (level: number, res: Express.Response, ...message: Array<any>) => (detail: Error): void => {
		log(level, location, ...message, detail)

		res.status(500).send({ success: false })
	},
})

export default error
