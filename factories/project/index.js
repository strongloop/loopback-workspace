/*!

 */
var path = require('path');
var util = require('util');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of ProjectFactory.
 */
function ProjectFactory(root) {
  if (!(this instanceof ProjectFactory)) {
    return new ProjectFactory(root);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(ProjectFactory, ModuleFactory);

/*!
 * Export `ProjectFactory`.
 */
module.exports = ProjectFactory;
