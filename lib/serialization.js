/**
 * Converting a Crumbs database to a cookie and vice versa
 */

const types = require('./types');

function serializeTable(table) {
	// Serialize from the inside-out because we need to know the lengths of values

	// Serialize columns
	let columnsValue = '';
	for (const column of table.columns) {
		columnsValue += escapeValue('COLUMN', column.type);
	}
	columnsValue = escapeValue('COLUMNS', columnsValue);

	// Serialize rows
	let rowsValue = '';
	for (const row of table.rows) {
		let rowValue = '';
		for (const value of row) {
			const serializedValue = types[value.type].serialize(value);
			rowValue += escapeValue('VALUE', serializedValue);
		}
		rowValue = escapeValue('ROW', rowValue);
	}
	rowsValue = escapeValue('ROWS', rowsValue);

	return escapeValue('TABLE', columnsValue + rowsValue);
}

function unserializeString(string) {
	const startRegex = /{BEGIN_(.+):([0-9]+)}/;
	const endRegex = /{END_(.+):([0-9]+)}/;

	// Look for beginning of escaped value
	const startIndex = string.search(startRegex);

	// If no more escaped values, return string
	if (startIndex < 0) return string;

	// Check to see if there's an
}

function escapeValue(label, value) {
	return '{BEGIN_' + label + ':' + value.length + '}' + value + '{END_' + label + '}';
}

module.exports = {
	serialize,
	unserialize
};
