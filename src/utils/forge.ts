export const forge = {
	repositoryId,
	branchId,
	pullRequestId,
}

function repositoryId({ type, project, repo }: Core.Repository): Core.Id {
	return `${type}_${project}_${repo}`
}

function branchId({ name, repository }: Core.Branch | Core.BranchRest | { name: string; repository: Core.Repository }): Core.Id {
	return `${repositoryId(repository)}_${name}`
}

function pullRequestId({ name, repository }: { name: string; repository: Core.Repository }): Core.Id {
	return `${repositoryId(repository)}_${name}`
}
