// get first two arguments
const [type, name] = process.argv.slice(2)

// read report file from last build
const report = require('fs').readFileSync(require('path').join(__dirname, '../../reports/unit/coverage/clover.xml'), { encoding: 'utf8' })
if (!report || !['branch', 'pr'].includes(type) || !name) {
	process.exit(-1)
}

// check type for upload
const path = type === 'branch' ? '/api/branches' : '/api/pullrequests'

// prepare data for submit, type is repository type: can be users or project.
// project is either the userid or the project (e.g webfleet) and repo is the name of the repository
// !!! adjust this for each repository !!!
const data = JSON.stringify({ name, repository: { type: 'users', project: 'riedel', repo: 'production' } })
// server options
const options = { hostname: 's02.sdev08.dev.ttw', port: 51337, path, method: 'POST', headers: { 'Content-Type': 'application/json' } }

// submit data
const req = require('http').request(options, res => res.on('data', d => process.exit(JSON.parse(d.toString('utf8')).success ? 0 : -1)))
req.on('error', console.error)
req.write(data)
req.end()
