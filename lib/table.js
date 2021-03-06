const { escapeValue } = require('./serialization');
const types = require('./types');

module.exports = class Table {

	constructor(db, options) {
		this.db = db;
		options = options || {};
		this.name = options.name || 'UNNAMED_TABLE';
		this.columns = options.columns || [];
		this.rows = [];
	}

	getFormattedObject() {
		return {
			columns: this.columns,
			rows: this.rows
		};
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
			this.db.updateCookie();
		});
	}

	get(query) {
		const rows = [];
		for (const row of this.rows) {
			if (this.evalCondition(row, query)) {
				rows.push(row);
			}
		}
		return rows;
	}

	update(query, newValues) {
		const changeValues = Object.keys(newValues);
		for (let row of this.rows) {
			if (this.evalCondition(row, query)) {
				console.log('change row');
				// Set new values
				for (const column of this.columns) {
					if (changeValues.includes(column.name) && types[column.type].isValid(newValues[column.name])) {
						row[column.name] = newValues[column.name];
					}
				}
			}
		}
	}

	delete(query) {
		for(let i = 0; i < this.rows; i++) {
			if (this.evalCondition(this.rows[i], query)) {
				this.rows.splice(i--, 1);
			}
		}
	}

	evalCondition(row, query = true) {
		// Sandbox the eval in an anonymous function to make it 100% safe, easy, secure, and fun for the whole family
		return eval('(function(row) { return ' + query + '})')(row);
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
		columnsValue = escapeValue('COLUMNS', columnsValue, true);

		// Serialize rows
		let rowsValue = '';
		for (const row of this.rows) {
			let rowValue = '';
			for (const column of this.columns) {
				const serializedValue = types[column.type].serialize(row[column.name]);
				rowValue += escapeValue('VALUE', serializedValue);
			}
			rowsValue += escapeValue('ROW', rowValue, true);
		}
		rowsValue = escapeValue('ROWS', rowsValue, true);

		return escapeValue('TABLE', columnsValue + rowsValue);
	}

}
