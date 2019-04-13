import { Bitbucket } from './bitbucket'

const baseUrl = ({ repository: { type, repo, project }, name }: Core.PullRequestRest) =>
	`${type}/${project}/repos/${repo}/pull-requests/${name}/`

export async function getBaseBranchFromPullrequest(pullRequest: Core.PullRequestRest): Promise<Core.BaseBranch> {
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
}
