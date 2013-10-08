/*!
 * A CRUD-capable model.
 */
var loopback = require('loopback');
var properties = require('./properties');
var config = require('./config');
var {name} = loopback.Model.extend('{name}', properties, config);

if (config['data-source']) {
  {name}.attachTo(require('../' + config['data-source']));
}

module.exports = {name};
