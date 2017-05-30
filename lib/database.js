const { unserializeString } = require('./serialization');
const Table = require('./table');

module.exports = class Database {

	constructor(name = 'crumbs') {
		this.name = name;
		this.version = require('../package.json').version;
		this.tables = [];

		console.log('Previous cookie value', Cookies.get('cdb-' + this.name));
		this.updateCookie();
	}

	createTable(options) {
		const table = new Table(this, options);
		this.tables.push(table);
		return table;
	}

	updateCookie() {
		const expires = new Date(Date.now() + (2 ** 31 - 1));
		Cookies.set('cdb-' + this.name, this.serialize(), { expires });
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
