module.exports = class Table {

	constructor(options) {
		options = options || {};
		this.columns = options.columns || 0;
	}

	get() {
		console.log(Cookies.get());
	}
}
