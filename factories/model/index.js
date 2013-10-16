/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of ModelFactory.
 */
function ModelFactory(root) {
  if (!(this instanceof ModelFactory)) {
    return new ModelFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(ModelFactory, ModuleFactory);

/*!
 * Export `ModelFactory`.
 */
module.exports = ModelFactory;
