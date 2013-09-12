/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of ApplicationFactory.
 */
function ApplicationFactory() {
  if (!(this instanceof ApplicationFactory)) {
    return new ApplicationFactory();
  }

  ModuleFactory.call(this);
}
util.inherits(ApplicationFactory, ModuleFactory);

/**
 * See ModuleFactory.render.
 */
ApplicationFactory.prototype.render = render;
function render(root, options, callback) {
  var self = this;

  if (!options.name) {
    options.name = 'LoopBack';
  }

  self.renderer.renderAll(path.join(__dirname, 'template'), root, options, callback);

  return self;
}

/**
 * See ModuleFactory.dependencies.
 */
ApplicationFactory.prototype.dependencies = dependencies;
function dependencies() {
  return {};
}

/*!
 * Export `ApplicationFactory`.
 */
module.exports = ApplicationFactory;
