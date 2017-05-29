window.Cookies = require('./node_modules/js-cookie/src/js.cookie.js');
const Database = require('./lib/database');
window.Crumbs = new Database();
