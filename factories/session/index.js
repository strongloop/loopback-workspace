/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of SessionFactory.
 */
function SessionFactory(root) {
  if (!(this instanceof SessionFactory)) {
    return new SessionFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(SessionFactory, ModuleFactory);

SessionFactory.defaults = {
  name: 'session',
  properties: {},
  config: {'data-source': 'db'}
};

/*!
 * Export `SessionFactory`.
 */
module.exports = SessionFactory;
