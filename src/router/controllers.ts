import { branchDb } from '../modules/db/branches'
import error from '../utils/error'
import { getBaseBranchFromPullrequest } from '../modules/bitbucket/get-base-branch'
import { pullRequestDb } from '../modules/db/pull-requests'
import { writeReportToBitbucket } from '../modules/bitbucket/comment'

const { routerError, internalError } = error('controllers:')

export const addBranchReport = async (req, res) => {
	const { name, repository, report } = req.body
	const action = (await branchDb.exists(repository, name)) ? branchDb.update : branchDb.create

	action({ name, repository, report })
		.then(() => {
			res.status(200).send({ success: true })
		})
		.catch(routerError(2, res, 'Error adding branch report.'))
}

export const addPullRequestReport = async (req, res) => {
	try {
		const pullRequestRest: Core.PullRequestRest = req.body
		const action = (await pullRequestDb.exists(pullRequestRest.repository, pullRequestRest.name))
			? pullRequestDb.update
			: pullRequestDb.create
		const base = await getBaseBranchFromPullrequest(pullRequestRest)

		const baseBranch = await branchDb.get(base.repository, base.name)
		if (!baseBranch) throw 'Base branch is not in the database.'
		const pr = await action(pullRequestRest, base)

		await writeReportToBitbucket(baseBranch, pr).catch(internalError(2, 'Error handling pull request:'))
		res.status(200).send({ success: true })
	} catch (err) {
		routerError(2, res, 'Error adding pullrequest report.')(err)
	}
}
