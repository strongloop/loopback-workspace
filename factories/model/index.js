/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of ModelFactory.
 */
function ModelFactory() {
  if (!(this instanceof ModelFactory)) {
    return new ModelFactory();
  }

  ModuleFactory.call(this);
}
util.inherits(ModelFactory, ModuleFactory);

/**
 * See ModuleFactory.render.
 */
ModelFactory.prototype.render = render;
function render(root, options, callback) {
  var self = this;

  self.renderer.renderAll(path.join(__dirname, 'template'), root, options, callback);

  return self;
}

/**
 * See ModuleFactory.dependencies.
 */
ModelFactory.prototype.dependencies = dependencies;
function dependencies() {
  return {};
}

/*!
 * Export `ModelFactory`.
 */
module.exports = ModelFactory;
