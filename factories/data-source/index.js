/*!
 * TODO: Description.
 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of DataSourceFactory.
 */
function DataSourceFactory(root) {
  if (!(this instanceof DataSourceFactory)) {
    return new DataSourceFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(DataSourceFactory, ModuleFactory);

DataSourceFactory.defaults = {
  "editor": "/tools/data-source-memory-edit/editor.html",
  "connector": "memory"
};

/*!
 * Export `DataSourceFactory`.
 */
module.exports = DataSourceFactory;
