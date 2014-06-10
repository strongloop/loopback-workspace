var app = require('../app');

/**
 * Base class for LoopBack definitions.
 *
 * @class Definition
 * @inherits WorkspaceEntity
 */

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

/**
 * Get the absolute directory that contains the `Definition`.
 *
 * @returns {String} dir
 */

Definition.prototype.getDir = function() {
  return path.join(WorkspaceEntity.getWorkspaceDir(), this.name);
}
