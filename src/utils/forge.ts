export const forge = {
	repositoryId,
	branchId,
	pullRequestId,
}

function repositoryId({ name, slug }: Core.Repository): Core.Id {
	return `${slug.replace('/', '_')}_${name}`
}

function branchId({ name, repository }: Core.Branch | Core.BranchRest | { name: string; repository: Core.Repository }): Core.Id {
	return `${repositoryId(repository)}_${name}`
}

function pullRequestId({ pullRequestId, repository }: { pullRequestId: string; repository: Core.Repository }): Core.Id {
	return `${repositoryId(repository)}_${pullRequestId}`
}
