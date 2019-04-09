const http = require('http')
const fs = require('fs')
const path = require('path')

const report = fs.readFileSync(path.join(__dirname, '../../reports/unit/coverage/clover.xml'), { encoding: 'utf8' })

if (!report) {
    process.exit(-1)
}

const [pullRequestId] = process.argv.slice(2)

const data = JSON.stringify({
    pullRequestId,
    repository: {
        slug: 'users/riedel',
        name: 'production'
    }
})

const options = {
    hostname: 's02.sdev08.dev.ttw',
    port: 51337,
    path: '/api/pullrequest',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

const req = http.request(options, (res) => {
    res.on('data', (d) => {
        console.log(d.toString('utf8'))
    })
})

req.on('error', console.error)

req.write(data)
req.end()
