#!/usr/bin/env node

import './config'

import { createServer } from 'http'
import logger from './utils/logger'
import { router } from './router'

const { port, address } = global

const log = (level, ...message) => logger(level, 'core -', ...message)

const server = createServer(router)

server.listen(port, address, () => {
	log(0, `listening to http://${address}:${port}/`)
})
