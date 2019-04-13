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
	const comment = createCommentObject(diff, existingComment)

	return existingComment ? updateComment(comment, existingComment, pr) : createComment(comment, pr)
}

function updateComment(comment: Core.CommentRest, existingComment: Core.Comment, pr: Core.PullRequest): Promise<Core.Comment> {
	return Bitbucket.put(createApiSlug(pr, existingComment.commentId), comment).then(({ version }) =>
		commentDb.create(pr.repository, pr.name, { commentId: existingComment.commentId, version }),
	)
}

function createComment(comment: Core.CommentRest, pr: Core.PullRequest): Promise<Core.Comment> {
	return Bitbucket.post(createApiSlug(pr), comment).then(({ id, version }: { id: number; version: number }) =>
		commentDb.create(pr.repository, pr.name, { commentId: id.toString(), version }),
	)
}
