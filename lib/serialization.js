/**
 * Converting a Crumbs database to a cookie and vice versa
 */

const types = require('./types');

function unserializeString(string, array = false) {
	// console.log('unserialize string', string);

	const startRegex = /^([{\[])BEGIN_([A-Z]+):([0-9]+)([}\]])/;
	const endRegex = /([{\[])END_([A-Z]+)([}\]])/;

	let pointer = 0;

	let unserialized;
	if (array) {
		unserialized = [];
	} else {
		unserialized = {};
	}

	// Loop through all nodes in the string
	while (pointer < string.length) {
		const remainingString = string.substring(pointer);

		// Look for beginning of escaped value
		const startSearch = startRegex.exec(remainingString);

		// If no more escaped values, break out of loop
		if (!startSearch) {
			return remainingString;
		}

		// If RegEx search doesn't return expected properties, it's not valid
		if (startSearch.length !== 5) {
			return string;
		}

		// If start and end characters aren't the same, not valid; return string.
		if ((startSearch[1] === '{' && startSearch[4] === ']') || (startSearch[1] === '[' && startSearch[4] === '}')) {
			return string;
		}

		const beginMarker = startSearch[0];
		const isArrayContainer = (startSearch[1] === '[');
		const escapedValueName = startSearch[2];
		const escapedValue = remainingString.substr(beginMarker.length, Number(startSearch[3]));

		const endMarker = startSearch[1] + 'END_' + escapedValueName + startSearch[4];

		// Check if the end marker is after specified character length
		if (!remainingString.startsWith(endMarker, beginMarker.length + escapedValue.length)) {
			return string;
		}

		// Recurse inside the escaped value to see if any more tags within it
		const unserializedValue = unserializeString(escapedValue, isArrayContainer);

		// If it's an array, push to it. Otherwise, add it to the object
		if (array) {
			// const firstKey = Object.keys(unserializedValue)[0];
			unserialized.push(unserializedValue);
		} else {
			unserialized[escapedValueName.toLowerCase()] = unserializedValue;
		}

		// Move onto the sibling node after this escaped value
		pointer += beginMarker.length + escapedValue.length + endMarker.length;
	}

	return unserialized;
}

function escapeValue(label, value, arrayContainer = false) {
	const beginChar = arrayContainer ? '[' : '{';
	const endChar = arrayContainer ? ']' : '}';

	const beginMarker = beginChar + 'BEGIN_' + label + ':' + value.length + endChar;
	const endMarker = beginChar + 'END_' + label + endChar;

	return beginMarker + value + endMarker;
}

module.exports = {
	unserializeString,
	escapeValue
};
