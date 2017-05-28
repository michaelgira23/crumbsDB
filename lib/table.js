module.exports = class Table {

	constructor(options) {
		options = options || {};
		this.columns = options.columns || [];
	}

	query() {

	}

	get() {
		const cookie = Cookies.get('crumbs');
	}

	set() {

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
