/*!
 * An in-memory DataSource for development.
 */
var loopback = require('loopback');
var options = require('./module.json');

module.exports = loopback.createDataSource(options);
