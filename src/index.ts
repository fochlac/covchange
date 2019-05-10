#!/usr/bin/env node

import './config'

import logger from './utils/logger'
import { router } from './router'

export default new Promise(resolve => {
	router.listen(global.port, global.address, () => {
		logger(0, `listening to http://${global.address}:${global.port}/`)
		logger(0, `connected to bitbucket instance ${global.bitbucket}`)
		logger(0, `with key ${global.bitbucketKey.slice(0,5)}*****${global.bitbucketKey.slice(-5)}`)
		logger(0, `writing logs to ${global.logFolder}`)
		logger(0, `using storage ${global.storage}`)
		resolve()
	})
})
