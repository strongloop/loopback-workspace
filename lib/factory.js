/*!
 * TODO: Description.
 */
var assert = require('assert');
var Generator = require('strong-generator');

/**
 * Creates a new instance of ModuleFactory.
 */
function ModuleFactory() {
  if (!(this instanceof ModuleFactory)) {
    return new ModuleFactory();
  }
}

/**
 * The built-in template renderer exposed for subclasses.
 *
 * @type {Renderer}
 */
ModuleFactory.prototype.renderer = new Generator();

/**
 * Renders a new Module instance at `root`.
 *
 * @param {String} root The root directory to render to.
 * @param {Object} options The options to use while rendering
 * @param {Function} callback An error-only callback.
 * @returns {ModuleFactory} The ModuleFactory instance, for cascading.
 */
ModuleFactory.prototype.render = render;
function render(root, options, callback) {
  assert(false, 'Invalid ModuleFactory class without render implementation: ' + self.constructor.name);
}

/**
 * Returns a package.json-compatible description of rendered Modules' dependencies.
 *
 * @returns {Object} An Object to be serialized and added as dependencies.
 */
ModuleFactory.prototype.dependencies = dependencies;
function dependencies() {
  // TODO: This structure for declaring dependencies doesn't allow for modules to require conflicting versions of a
  // dependency. We should look into more complex modules receiving their own package.json file.
  return {};
}

/*!
 * Export `ModuleFactory`.
 */
module.exports = ModuleFactory;
