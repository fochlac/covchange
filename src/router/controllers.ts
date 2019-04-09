import { branchDb } from '../modules/db/branches'
import { createComment } from '../../dist/modules/bitbucket/comment'
import error from '../utils/error'
import { pullRequestDb } from '../modules/db/pull-requests'

const { routerError, internalError } = error('controllers:')

export const addBranchReport = async (req, res) => {
	const { name, repository, report } = req.body
	const action = (await branchDb.exists(repository, name)) ? branchDb.update : branchDb.create

	action({ name, repository, report })
		.then(() => {
			res.status(200).send({ success: true })
		})
		.catch(routerError(2, res, 'Error creating branch.'))
}

export const addPullRequestReport = async (req, res) => {
	try {
		const { base, repository, report, pullRequestId } = req.body
		const action = (await pullRequestDb.exists(repository, pullRequestId)) ? pullRequestDb.update : pullRequestDb.create

		const pr = await action({ base, repository, report, pullRequestId })
		const baseBranch = await branchDb.get(repository, base)

		res.status(200).send({ success: true })

		if (!baseBranch) return Promise.reject('Base branch is not in the database.')
		createComment(baseBranch, pr)
	} catch (err) {
		internalError(2, 'Error handling pull request:')(err)
	}
}
