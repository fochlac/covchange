export function toBoolean(input?:any):boolean {
	return !!input && !!input.toString && /^(true|1|TRUE)$/.test(input.toString())
}
