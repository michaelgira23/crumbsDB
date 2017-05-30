/**
 * crumbsDB Demo Server
 * We need to run a server so the browser can save our cookies!
 */

const port = 4222;

const express = require('express');
const app = express();

const path = require('path');

// Static files
app.use('/assets', express.static(path.join(__dirname, 'demo-assets')));
app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));
app.use('/dependencies', express.static(path.join(__dirname, 'node_modules')));

// Main page
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'demo-assets', 'demo.html'));
});

// Start web server
app.listen(port, () => console.log(`Demo running on *:${port}`));
