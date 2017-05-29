const table = Crumbs.createTable({
	name: 'users',
	columns: [
		{
			name: 'username',
			type: 'string'
		},
		{
			name: 'password',
			type: 'string'
		},
		{
			name: 'isConfirmed',
			type: 'boolean'
		}
	]
});

table.insert({
	username: 'mgira',
	password: 'Hunter2',
	isConfirmed: true
});

console.log('formatted table', table.getFormattedObject());
