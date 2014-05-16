var app = require('../');
var ModelDefinition = app.models.ModelDefinition;
var PropertyDefinition = app.models.ModelPropertyDefinition;
var async = require('async');

ModelDefinition.validatesUniquenessOf('name', { scopedTo: ['projectId'] });
ModelDefinition.validatesPresenceOf('name', 'dataSource');

/**
 * Convert an array of model definitions to a json-like config object
 * that can be stored in models.json
 * @param {Array.<ModelDefinition>} models
 * @param {function(Error=, Object=)} cb
 */
ModelDefinition.arrayToConfigObject = function(models, cb) {
  async.map(
    models,
    function(m, cb) { m._toConfigWithName(cb); },
    function(err, namedEntries) {
      if (err) return cb(err);

      var config = {};
      namedEntries.forEach(function(entry) {
        var name = entry.name;
        delete entry.name;
        config[name] = entry;
      });
      cb(null, config);
    });
};

ModelDefinition.prototype._toConfigWithName = function(cb) {
  var FORCE_RELOAD = true;
  this.properties(FORCE_RELOAD, function(err, properties) {
    if (err) return cb(err);

    PropertyDefinition.arrayToConfigObject(properties, function(err, propCfg) {
      if (err) return cb(err);

      var config = this.toObject();
      delete config.id;
      delete config.projectId;

      if (Object.keys(propCfg).length) {
        config.properties = propCfg;
      }
      cb(null, config);
    }.bind(this));
  }.bind(this));
};

ModelDefinition.prototype._createPropertiesFromConfig = function(propCfg, cb) {
  async.each(Object.keys(propCfg), function(propertyName, cb) {
    var prop = propCfg[propertyName];
    if (typeof prop === 'string') {
      prop = { type: prop };
    }
    prop.name = propertyName;
    this.properties.create(prop, cb);
  }.bind(this), cb);
};
