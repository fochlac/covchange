global.port = process.env.COVWATCHER_PORT ? +process.env.COVWATCHER_PORT : 8080
global.address = process.env.COVWATCHER_ADDRESS || 'localhost'
global.appRoot = process.env.COVWATCHER_APPROOT || 'c:\\github\\covchange\\'
global.storage = process.env.COVWATCHER_STORAGE || 'c:\\github\\covchange\\storage\\'
global.logLevel = 6
global.bitbucket = process.env.COVWATCHER_BITBUCKET || 'https://bitbucket.ttt-sp.com'
