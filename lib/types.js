module.exports = {
	number: {
		isValid: val => typeof val === 'number',
		serialize: val => val.toString(),
		unserialize: val => Number(val)
	},
	string: {
		isValid: val => typeof val === 'string',
		serialize: val => val,
		unserialize: val => val
	},
	boolean: {
		isValid: val => typeof val === 'boolean',
		serialize: val => val.toString(),
		unserialize: val => val === 'true'
	}
};
