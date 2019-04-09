import * as request from 'request-promise-native'

import { Bitbucket } from './api'
import error from '../../utils/error'

const { internalError } = error('bitbucket comment:')

const baseUrl = ({ repository: { slug, name }, pullRequestId }: Core.PullRequestRest) =>
	`${slug}/repos/${name}/pull-requests/${pullRequestId}/`

export async function getBaseBranchFromPullrequest(pullRequest: Core.PullRequestRest): Promise<Core.BaseBranch> {
	try {
		const { toRef } = await Bitbucket.get(baseUrl(pullRequest))

		const slug = toRef.repository.project.type === 'NORMAL' ? 'projects' : 'users'

		return {
			name: toRef.displayId,
			repository: {
				name: toRef.repository.slug,
				slug: `${slug}/${toRef.repository.project.key}`,
			},
		}
	} catch (err) {
		internalError(2, 'Error fetching comment.')(err)
	}
}
