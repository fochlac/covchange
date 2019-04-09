import * as request from 'request-promise-native'

import { Bitbucket } from './bitbucket'
import error from '../../utils/error'

const { internalError } = error('bitbucket comment:')

const baseUrl = ({ repository: { type, repo, project }, name }: Core.PullRequestRest) =>
	`${type}/${repo}/repos/${project}/pull-requests/${name}/`

export async function getBaseBranchFromPullrequest(pullRequest: Core.PullRequestRest): Promise<Core.BaseBranch> {
	try {
		const { toRef } = await Bitbucket.get(baseUrl(pullRequest))

		const type = toRef.repository.project.type === 'NORMAL' ? 'projects' : 'users'

		return {
			name: toRef.displayId,
			repository: {
				repo: toRef.repository.slug,
				type,
				project: toRef.repository.project.key,
			},
		}
	} catch (err) {
		internalError(2, 'Error fetching comment.')(err)
	}
}
