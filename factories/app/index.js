/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of ApplicationFactory.
 */
function ApplicationFactory(root) {
  if (!(this instanceof ApplicationFactory)) {
    return new ApplicationFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(ApplicationFactory, ModuleFactory);

ApplicationFactory.defaults = {
  "editor": "/tools/app-edit/editor.html",
  "port": 3000,
  "hostname": '0.0.0.0',
  "middleware": [
    "compress",
    "favicon",
    "logger",
    "bodyParser",
    "methodOverride",
    "rest"
  ]
};

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
