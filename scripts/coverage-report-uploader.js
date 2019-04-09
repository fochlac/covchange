const [type, name] = process.argv.slice(2)
const report = require('fs').readFileSync(require('path').join(__dirname, '../../reports/unit/coverage/clover.xml'), { encoding: 'utf8' })
if (!report || !['branch', 'pr'].includes(type) || !name) {
	process.exit(-1)
}
const path = type === 'branch' ? '/api/branches' : '/api/pullrequests'
const data = JSON.stringify({ name, repository: { type: 'users', project: 'riedel', repo: 'production' } })
const options = { hostname: 's02.sdev08.dev.ttw', port: 51337, path, method: 'POST', headers: { 'Content-Type': 'application/json' } }

const req = require('http').request(options, res => res.on('data', d => process.exit(JSON.parse(d.toString('utf8')).success ? 0 : -1)))
req.on('error', console.error)
req.write(data)
req.end()
