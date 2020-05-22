module.exports.operations = operations = [
	'select',
	'insert into'
];
module.exports.keywords = keywords = [
	'from',
	'where'
];

module.exports = class QueryParser {

	constructor(table) {
		this.table = table;
	}

	query(query) {

	}

}
