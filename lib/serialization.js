/**
 * Converting a Crumbs database to a cookie and vice versa
 */

const types = require('./types');

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
	unserializeString,
	escapeValue
};
