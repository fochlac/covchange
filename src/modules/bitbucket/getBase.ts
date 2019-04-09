import * as request from 'request-promise-native'

import error from '../../utils/error'

const { internalError } = error('bitbucket comment:')

const Authorization = global.bitbucketKey
const baseUrl = ({ repository: { slug, name }, pullRequestId }: Core.PullRequestRest) =>
	`${global.bitbucket}/rest/api/1.0/${slug}/repos/${name}/pull-requests/${pullRequestId}/`


export async function getBaseBranchFromPullrequest(pullRequest:Core.PullRequestRest):Promise<Core.BaseBranch> {
	const uri = baseUrl(pullRequest)
	try {
		const { toRef } = await request({
			uri,
			method: 'GET',
			json: true,
			headers: {
				Authorization,
			}
		})

		const slug = toRef.repository.project.type === 'NORMAL' ? 'projects' : 'users'

		return {
			name: toRef.displayId,
			repository: {
				name: toRef.repository.slug,
				slug: `${slug}/${toRef.repository.project.key}`
			}
		}

	}
	catch(err) {
		internalError(2, 'Error fetching comment.')(err)
	}
}
