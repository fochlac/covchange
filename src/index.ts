#!/usr/bin/env node

import './config'

import logger from './utils/logger'
import { router } from './router'

export default new Promise(resolve => {
	router.listen(global.port, global.address, () => {
		logger(0, `listening to http://${global.address}:${global.port}/`)
		resolve()
	})
})
