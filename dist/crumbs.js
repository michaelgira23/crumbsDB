/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Converting a Crumbs database to a cookie and vice versa
 */

const types = __webpack_require__(1);

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
	number: {
		isValid: val => typeof val === 'number',
		serialize: val => val.toString(),
		unserialize: val => Number(val)
	},
	string: {
		isValid: val => typeof val === 'string',
		serialize: val => val,
		unserialize: val => val
	},
	boolean: {
		isValid: val => typeof val === 'boolean',
		serialize: val => val.toString(),
		unserialize: val => val === 'true'
	}
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const { unserializeString } = __webpack_require__(0);
const Table = __webpack_require__(5);

module.exports = class Database {

	constructor(name = 'crumbs') {
		this.name = name;
		this.version = __webpack_require__(6).version;
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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

window.Cookies = __webpack_require__(3);
const Database = __webpack_require__(2);
window.Crumbs = Database;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const { escapeValue } = __webpack_require__(0);
const types = __webpack_require__(1);

module.exports = class Table {

	constructor(options) {
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
		});
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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {
	"name": "crumbsdb",
	"version": "1.0.0",
	"description": "A back-end is very inefficient and causes delay. Store your data in cookies instead.",
	"main": "index.js",
	"scripts": {
		"compile": "webpack ./index.js dist/crumbs.js",
		"compile:watch": "webpack --watch ./index.js dist/crumbs.js",
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"repository": {
		"type": "git",
		"url": "git+https://github.com/michaelgira23/crumbsDB.git"
	},
	"keywords": [
		"crumbsdb",
		"crumbs",
		"cookies"
	],
	"author": "Michael Gira",
	"license": "MIT",
	"bugs": {
		"url": "https://github.com/michaelgira23/crumbsDB/issues"
	},
	"homepage": "https://github.com/michaelgira23/crumbsDB#readme",
	"dependencies": {
		"jquery": "^3.2.1",
		"js-cookie": "^2.1.4",
		"node-sql-parser": "0.0.1",
		"node-sqlparser": "^1.0.2",
		"simple-sql-parser": "^2.0.0-alpha.1",
		"sql-parser": "^0.5.0",
		"sqljs": "git://github.com/langpavel/node-sqljs.git"
	},
	"devDependencies": {
		"bootstrap": "^4.0.0-alpha.6",
		"typescript": "^2.1.6",
		"webpack": "^2.6.1"
	}
};

/***/ })
/******/ ]);