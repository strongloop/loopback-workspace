'use strict';
const config = require('./config');
const PackageDefinition = require('./datamodel/package-definition');
const fsUtility = require('./util/file-utility');

/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addPackageDefinition(definition, cb) {
    const packageDef = new PackageDefinition(this, 'package.json', definition);
    fsUtility.writePackageDefinition(packageDef, cb);
  }
};

module.exports = Tasks;
