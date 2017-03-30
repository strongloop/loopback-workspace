'use strict';

const PackageDefinition = require('../datamodel/package-definition');
const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');

/**
 * @class PackageDefinitionActions
 *
 * Atomic tasks that link the in-memory graph with package definition.
 * Every task can be performed using a processor.
 */

class PackageDefinitionActions {
  create(cb) {
    const workspace = this.getWorkspace();
    fsUtility.writePackageDefinition(this, cb);
  }
}

mixin(PackageDefinition.prototype, PackageDefinitionActions.prototype);
