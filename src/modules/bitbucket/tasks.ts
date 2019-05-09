import { Bitbucket } from './bitbucket'

function createApiSlug(taskId?: Core.Id) {
	return `tasks/${taskId || ''}`
}

function updateTask(comment: Core.Comment, open?: boolean): Promise<Core.Id> {
	return Bitbucket.put(createApiSlug(comment.taskId), {
		id: comment.taskId,
		state: open ? 'OPEN' : 'RESOLVED',
	}).then(({ id }: { id: number }) => id.toString())
}

function createTask(comment: Core.Comment): Promise<Core.Id> {
	return Bitbucket.post(createApiSlug(), {
		text: 'Please add more unit tests.',
		anchor: {
			id: comment.commentId,
			type: 'COMMENT',
		},
	}).then(({ id }: { id: number }) => id.toString())
}

export function openTask(comment: Core.Comment): Promise<Core.Id> {
	return comment.taskId ? updateTask(comment, true) : createTask(comment)
}

export function resolveTask(comment: Core.Comment) {
	return comment.taskId ? updateTask(comment, false) : Promise.resolve(comment.taskId)
}
