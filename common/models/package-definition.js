// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const app = require('../../server/server');

module.exports = function(PackageDefinition) {
  app.once('ready', function() {
    ready(PackageDefinition);
  });
};

function ready(PackageDefinition) {
  const models = app.models;
  const ConfigFile = models.ConfigFile;

  PackageDefinition.validatesFormatOf('name', {with: /^[\-_a-zA-Z0-9]+$/});

  PackageDefinition.prototype.getUniqueId = function() {
    return this.name || null;
  };

  PackageDefinition.saveToFs = function(cache, packageDef, cb) {
    // TODO(bajtos) Move this method to WorkspaceEntity
    const configFile = new ConfigFile({
      path: PackageDefinition.getPath('.', packageDef),
      data: PackageDefinition.getConfigFromData(packageDef),
    });
    configFile.save(cb);
  };
}
