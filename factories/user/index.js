/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of UserFactory.
 */
function UserFactory(root) {
  if (!(this instanceof UserFactory)) {
    return new UserFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(UserFactory, ModuleFactory);

UserFactory.defaults = {
  name: 'user',
  properties: {},
  config: {'data-source': 'db'}
};

/*!
 * Export `UserFactory`.
 */
module.exports = UserFactory;
