const request = require('request-promise-native')

import error from '../../utils/error'

const bitbucketurl = `${global.bitbucket}/rest/api/1.0/`
const Authorization = global.bitbucketKey
const { internalError } = error('Bitbucket API call failed: ')

export const Bitbucket = {
	get: (url: string): Promise<any> => apiCall({ url, method: 'get' }),
	put: (url: string, body: any): Promise<any> => apiCall({ method: 'put', url, body }),
	post: (url: string, body: any): Promise<any> => apiCall({ method: 'post', url, body }),
}

interface ApiConfig {
	uri: string
	method: string
	json: boolean
	headers: { [key: string]: string }
	body?: any
}
interface ApiCallParameter {
	url: string
	method?: string
	body?: any
}
function apiCall({ url, method, body }: ApiCallParameter): Promise<any> {
	const config: ApiConfig = {
		uri: bitbucketurl + url,
		method,
		json: true,
		headers: {
			Authorization,
		},
	}

	if (body) {
		config.body = body
	}

	return request(config).catch(
		internalError(2, `Error sending ${method}-request to ${url} with payload:\n ${JSON.stringify(body, null, 2)}`),
	)
}
