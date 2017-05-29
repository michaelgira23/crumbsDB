const types = require('./types');

module.exports = class Table {

	constructor(options) {
		options = options || {};
		this.name = options.name || 'UNNAMED_TABLE';
		this.columns = options.columns || [];
		this._rows = [];
	}

	get rows() {
		return this._rows;
	}

	set rows(value) {
		this._rows = value;
		// @TODO: Do some logic and rewrite data into cookie
	}

	query() {

	}

	getFormattedObject() {
		return {
			columns: this.columns,
			rows: this.rows
		};
	}

	get() {

	}

	insert(row) {
		return new Promise((resolve, reject) => {
			// Map each column name to it's other info
			let columns = {};
			for (const column of this.columns) {
				columns[column.name] = column;
			}

			console.log('columns', columns);

			// Make sure each value in row is valid
			for (const columnName of Object.keys(row)) {
				if (typeof columns[columnName] === 'undefined') {
					reject('Column "' + columnName + '" does not exist on table "' + this.name + '"!');
					return;
				}
			}

			// Go through each column to make sure the types are valid
			for (const tableColumn of Object.keys(columns)) {
				const columnData = columns[tableColumn];
				if (!types[columnData.type].isValid(row[tableColumn])) {
					reject('Column "' + insertColumn + '" is not of type "' + columnData.type + '"!');
					return;
				}
			}

			// Insert into rows
			this.rows.push(row);
		});
	}

	update() {

	}

	delete() {

	}

	serialize() {

	}

	static unserialize(string) {

	}
}
