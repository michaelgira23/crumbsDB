const { unserializeString } = require('./serialization');
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

	static unserialize(string) {
		return new Promise((resolve, reject) => {
			const prefixRegex = /^\[crumbsDB ([0-9.]+)\]/;
			const regexSearch = prefixRegex.exec(string);

			if (regexSearch.length !== 2) {
				reject('Cannot find crumbsDB header or version number!');
				return;
			}

			const version = regexSearch[1];

			const serializedDb = string.replace(prefixRegex, '');
			const unserializedDb = unserializeString(serializedDb);

			resolve(unserializedDb);
		});
	}

}
