const Table = require('./table');

module.exports = class Database {

	constructor(name = 'crumbs') {
		this.name = name;
		this.version = require('../package.json').version;
		this.tables = [];
	}

	createTable(options) {
		const table = new Table(options);
		this.tables.push(table);
		return table;
	}

	serialize() {
		// Get tables
		let tablesValue = '';
		for (const table of this.tables) {
			tablesValue += table.serialize();
		}

		// Prepend crumbsDB + version
		const prefix = '[crumbsDB ' + this.version + ']';

		return prefix + tablesValue;
	}

}
