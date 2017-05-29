/**
 * Converting a Crumbs database to a cookie and vice versa
 */

const types = require('./types');

function unserializeString(string) {
	// console.log('unserialize string', string);

	const startRegex = /^{BEGIN_([A-Z]+):([0-9]+)}/;
	const endRegex = /{END_([A-Z]+)}/;

	// Look for beginning of escaped value
	const startSearch = startRegex.exec(string);

	// If no more escaped values, return string
	if (startSearch === null || startSearch.length !== 3) {
		return string;
	}

	const escapedValueName = startSearch[1];
	const escapedValueLength = Number(startSearch[2]);

	const endMarker = '{END_' + escapedValueName + '}';

	const endMarkerIndex = string.indexOf(endMarker);

	// If no end marker or in wrong location, it's not valid. Just return string.
	if (endMarkerIndex !== startSearch[0].length + escapedValueLength) {
		return string;
	}

	// Extract escaped value
	const escapedValue = string.substr(startSearch[0].length, escapedValueLength);
	const unserializedValue = unserializeString(escapedValue);

	// Unserialize anything after the end marker
	const escapedValueAfter = string.substring(endMarkerIndex + endMarker.length);
	const unserializedAfter = unserializeString(escapedValueAfter);
	const unserializedAfterName = Object.keys(unserializedAfter)[0];
	const unserializedAfterValue = unserializedAfter[unserializedAfterName];

	console.log('unserialized values', escapedValueName, unserializedValue, unserializedAfter);

	let unserialized;

	if (escapedValueName === unserializedAfterName) {
		// If consecutive values are the same name, make array
		unserialized = [
			unserializedValue,
			unserializedAfterValue
		];
	} else {
		// If consecutive values are different, make object
		unserialized = {};
		unserialized[escapedValueName.toLowerCase()] = unserializedValue;
		unserialized[unserializedAfterName] = unserializedAfterValue;
	}
	return unserialized;
}

function escapeValue(label, value) {
	return '{BEGIN_' + label + ':' + value.length + '}' + value + '{END_' + label + '}';
}

module.exports = {
	unserializeString,
	escapeValue
};
