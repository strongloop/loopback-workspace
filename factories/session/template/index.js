/*!
 * A CRUD-capable model.
 */
var loopback = require('loopback');
var options = require('./module.json');
var {className} = loopback.Session.extend('{dashedName}',
                  options.properties, options.config);

if (options.config['data-source']) {
  {className}.attachTo(require('../' + config['data-source']));
}

module.exports = {className};
