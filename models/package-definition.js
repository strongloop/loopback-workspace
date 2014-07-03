var PackageDefinition = require('../app').models.PackageDefinition;

PackageDefinition.prototype.getUniqueId = function() {
  return this.name || null;
}
