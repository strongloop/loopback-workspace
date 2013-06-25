/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of RestAdapterFactory.
 */
function RestAdapterFactory() {
  if (!(this instanceof RestAdapterFactory)) {
    return new RestAdapterFactory();
  }

  ModuleFactory.call(this);
}
util.inherits(RestAdapterFactory, ModuleFactory);

/**
 * See ModuleFactory.render.
 */
RestAdapterFactory.prototype.render = render;
function render(root, options, callback) {
  var self = this;

  self.renderer.renderAll(path.join(__dirname, 'template'), root, options, callback);

  return self;
}

/**
 * See ModuleFactory.dependencies.
 */
RestAdapterFactory.prototype.dependencies = dependencies;
function dependencies() {
  return {};
}

/*!
 * Export `RestAdapterFactory`.
 */
module.exports = RestAdapterFactory;
