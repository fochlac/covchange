global.port = process.env.COVWATCHER_PORT ? +process.env.COVWATCHER_PORT : 51337
global.address = process.env.COVWATCHER_ADDRESS || 'localhost'
global.appRoot = process.env.COVWATCHER_APPROOT || ''
global.storage = process.env.COVWATCHER_STORAGE || ''
global.logLevel = 6
global.bitbucket = process.env.COVWATCHER_BITBUCKET || ''
global.bitbucketKey = process.env.COVWATCHER_BITBUCKET_KEY || ''
