/*!
 * A CRUD-capable model.
 */
var loopback = require('loopback');
var options = require('./module.json');
var emailModel = options.config.emailModel || 'email';
var sessionModel = options.config.sessionModel || 'session';
var {className} = loopback.Email.extend('{dashedName}',
                  options.properties, options.config);

if (options.config['data-source']) {
  {className}.attachTo(require('../' + config['data-source']));
}

{className}.email = require('../' + emailModel);
{className}.session = require('../' + sessionModel);

module.exports = {className};
