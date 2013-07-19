/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of DataSourceFactory.
 */
function DataSourceFactory() {
  if (!(this instanceof DataSourceFactory)) {
    return new DataSourceFactory();
  }

  ModuleFactory.call(this);
}
util.inherits(DataSourceFactory, ModuleFactory);

/**
 * See ModuleFactory.render.
 */
DataSourceFactory.prototype.render = render;
function render(root, options, callback) {
  var self = this;

  self.renderer.renderAll(path.join(__dirname, 'template'), root, options, callback);

  return self;
}

/**
 * See ModuleFactory.dependencies.
 */
DataSourceFactory.prototype.dependencies = dependencies;
function dependencies() {
  return {};
}

/*!
 * Export `DataSourceFactory`.
 */
module.exports = DataSourceFactory;
