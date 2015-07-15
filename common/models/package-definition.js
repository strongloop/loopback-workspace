var app = require('../../');

module.exports = function(PackageDefinition) {
  app.on('ready', function() {
    ready(PackageDefinition);
  });
}

function ready(PackageDefinition) {
  var models = app.models;
  var ConfigFile = models.ConfigFile;

  PackageDefinition.validatesFormatOf('name', { with: /^[\-_a-zA-Z0-9]+$/ });

  PackageDefinition.prototype.getUniqueId = function() {
    return this.name || null;
  }

  PackageDefinition.saveToFs = function(cache, packageDef, cb) {
    // TODO(bajtos) Move this method to WorkspaceEntity
    var configFile = new ConfigFile({
      path: PackageDefinition.getPath('.', packageDef),
      data: PackageDefinition.getConfigFromData(packageDef)
    });
    configFile.save(cb);
  };

};
