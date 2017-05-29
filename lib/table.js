const { escapeValue } = require('./serialization');
const types = require('./types');

module.exports = class Table {

	constructor(options) {
		options = options || {};
		this.name = options.name || 'UNNAMED_TABLE';
		this.columns = options.columns || [];
		this.rows = [];
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

	serialize() {
		// Serialize from the inside-out because we need to know the lengths of values

		// Serialize columns
		let columnsValue = '';
		for (const column of this.columns) {
			const nameValue = escapeValue('NAME', column.name);
			const typeValue = escapeValue('TYPE', column.type);
			columnsValue += escapeValue('COLUMN', nameValue + typeValue);
		}
		columnsValue = escapeValue('COLUMNS', columnsValue);

		// Serialize rows
		let rowsValue = '';
		for (const row of this.rows) {
			let rowValue = '';
			for (const column of this.columns) {
				const serializedValue = types[column.type].serialize(row[column.name]);
				rowValue += escapeValue('VALUE', serializedValue);
			}
			rowsValue += escapeValue('ROW', rowValue);
		}
		rowsValue = escapeValue('ROWS', rowsValue);

		return escapeValue('TABLE', columnsValue + rowsValue);
	}

	static unserialize(string) {

	}
}
