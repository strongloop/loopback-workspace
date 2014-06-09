var app = require('../app');
var Definition = app.models.Definition;

/**
 * Return the object in its form to be written to config.
 * 
 * **Note:** sub-classes should override this method to customize
 * how they are written to a config file.
 *
 * @returns {Object}
 */

Definition.prototype.toConfig = function() {
  return this.toJSON();
}

/**
 * Constructs the `Definition` from the serialized config value.
 * 
 * **Note:** sub-classes should override this method to customize
 * how they are read to from config file.
 *
 * @returns {Object}
 */

Definition.fromConfig = function(config) {
  var Constructor = this;
  return new Constructor(config);
}

/**
 * Called internally when underlying config has been `touched`.
 */

Definition.prototype.touch = function() {

}

Definition.prototype.getDir = function() {
  return path.join(WorkspaceEntity.getWorkspaceDir(), this.dir);
}

Definition.prototype.getEnv = function() {
  // TODO(ritch) this might change
  return process.env.NODE_ENV;
}


