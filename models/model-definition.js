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

ModelDefinition.loadModelConfig = function(models, name, cb) {
  var dir = path.dirname(models._configFile);
  var meta = models._meta;
  var sources = (meta && meta.modelSources) || ['./models'];

  async.waterfall([
    find,
    load,
    cache
  ], cb);

  function find(cb) {
    ModelDefinition.findRelativeFiles(dir, sources, name,
      ModelDefinition.settings.configExtensions, cb);
  }
  function load(files, cb) {
    async.map(files, ModelDefinition.loadFile, cb);
  }
  function cache(files, cb) {
    async.each(files, function(fileData) {
      // this means model names must be globally unique
      // we should look into a workaround for this
      ModelDefinition.addToCache(name, fileData);
      ModelDefinition.addRelatedDataToCache(name, fileData, cb);
    }, cb);
  }
}

ModelDefinition.populateCacheFromConfig = function(config, cb) {
  var names = Object.keys(config);
  var ModelDefinition = this;

  async.each(names, function(name, cb) {
    if(name[0] !== '_') return;
    ModelDefinition.loadModelConfig(models, name, cb);
  }, cb);
}

ModelDefinition.prototype.saveToFs = function() {
  // save to source/$name.json
  // and models.json
}
