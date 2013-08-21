/*!
 * A CRUD-capable model.
 */
var loopback = require('loopback');
var properties = require('./properties');
var config = require('./config');
var {name} = loopback.createModel('{name}', properties, config);
var applications = config.applications || [];

if (config['data-source']) {
  {name}.attachTo(require('../' + config['data-source']));
}

applications.forEach(function (name) {
  var app = require('../' + name);
  app.model({name});
});

module.exports = {name};
