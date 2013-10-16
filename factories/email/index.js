/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of EmailFactory.
 */
function EmailFactory(root) {
  if (!(this instanceof EmailFactory)) {
    return new EmailFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(EmailFactory, ModuleFactory);

EmailFactory.defaults = {
  name: 'email',
  properties: {},
  config: {'data-source': 'mail'}
};

/*!
 * Export `EmailFactory`.
 */
module.exports = EmailFactory;
