var app = require('../app');
var async = require('async');

/**
 * Defines a LoopBack `Model`.
 *
 * @class ModelDefinition
 * @inherits Definition
 */

var ModelDefinition = app.models.ModelDefinition;

/**
 * - `name` is required and must be unique per `AppDefinition`
 * 
 * @header Property Validation
 */

ModelDefinition.validatesUniquenessOf('name', { scopedTo: ['app'] });
ModelDefinition.validatesPresenceOf('name');

ModelDefinition.prototype.toConfig = function(cb) {
  var config = this.toJSON();
  var modelDefinition = this;

  config.configFile = this.getConfigFile();

  var steps = [
    get('properties'),
    get('relations'),
    get('validations'),
    get('accessControls'),
    get('methods')
  ];

  async.parallel(steps, function(err) {
    if(err) return cb(err);
    cb(null, config);
  });

  function get(relation) {
    return function(cb) {
      modelDefinition[relation](function(err, related) {
        if(err) return cb(err);
        config[relation] = related; // convert to object?
        cb();
      });
    }
  }
}
