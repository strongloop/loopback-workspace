// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../../server/server');

module.exports = function(PackageDefinition) {
  app.once('ready', function() {
    ready(PackageDefinition);
  });
};

function ready(PackageDefinition) {
  var models = app.models;
  var ConfigFile = models.ConfigFile;

  PackageDefinition.validatesFormatOf('name', { with: /^[\-_a-zA-Z0-9]+$/ });

  PackageDefinition.prototype.getUniqueId = function() {
    return this.name || null;
  };

  PackageDefinition.saveToFs = function(cache, packageDef, cb) {
    // TODO(bajtos) Move this method to WorkspaceEntity
    var configFile = new ConfigFile({
      path: PackageDefinition.getPath('.', packageDef),
      data: PackageDefinition.getConfigFromData(packageDef),
    });
    configFile.save(cb);
  };
};
