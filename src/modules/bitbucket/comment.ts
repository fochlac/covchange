import { openTask, resolveTask } from './tasks'

import { Bitbucket } from './bitbucket'
import { commentDb } from '../db/comments'
import { createCommentObject } from '../../utils/parsing/create-comment'
import { diffReports } from '../../utils/parsing/diff'

function createApiSlug({ repository: { type, repo, project }, name }: Core.PullRequest, commentId?: Core.Id) {
	return `${type}/${project}/repos/${repo}/pull-requests/${name}/comments/${commentId || ''}`
}

export async function writeReportToBitbucket(base: Core.Branch, pr: Core.PullRequest) {
	const diff = diffReports(base.reports[0], pr.reports[0])
	const existingComment = await commentDb.get(pr.repository, pr.name)
	const comment = createCommentObject(diff, existingComment, pr.lcov)

	const { id, version }: { id: number; version: number } = existingComment
		? await Bitbucket.get(createApiSlug(pr, existingComment.commentId))
			.then(({ version, id }) => Bitbucket.put(createApiSlug(pr, id), { ...comment, version }))
		: await Bitbucket.post(createApiSlug(pr), comment)

	const newComment: Core.Comment = {
		...existingComment,
		commentId: id.toString(),
		version,
	}

	if (pr.task && diff.total.diff.statementCov < 0) {
		newComment.taskId = await openTask(newComment)
	} else if (newComment.taskId && diff.total.diff.statementCov >= 0) {
		await resolveTask(newComment)
	}

	return commentDb.set(pr.repository, pr.name, newComment)
}
