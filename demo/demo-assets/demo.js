const database = new Crumbs();
const table = database.createTable({
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

table.insert({
	username: 'notmgira',
	password: 'Gatherer3',
	isConfirmed: false
});

table.insert({
	username: 'adsf',
	password: 'Gatherer3',
	isConfirmed: false
});

console.log('formatted table', table.getFormattedObject());

const serializedDB = database.serialize();
console.log('serialized db', serializedDB);

const unserializedDB = Crumbs.unserialize(serializedDB)
	.then(console.log.bind(null, 'unserialized db'));

console.log('query get', table.get());
console.log('query update', table.update('row.username === "mgira"', { hello: 'world', username: 'othermgira' }));
console.log('query get', table.get());
console.log('query delete', table.delete('row.username === "notmgira"'));
console.log('query get', table.get());
