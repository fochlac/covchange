import clone from 'clone'
const data = {}
const instances = {}

export default async id => {
	if (!instances[id]) {
		data[id] = {}
		instances[id] = {
			get: jest.fn(key => clone(data[id][key])),
			set: jest.fn((key, value) => {
				data[id][key] = clone(value)
			}),
		}
	}

	return Promise.resolve(instances[id])
}
