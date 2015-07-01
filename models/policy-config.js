var app = require('../app');
var loopback = require('loopback');
var debug = require('debug')('workspace:policy');
var ConfigFile = app.models.ConfigFile;
var path = require('path');

var GatewayMap = app.models.GatewayMap;
var Pipeline = app.models.Pipeline;
var Policy = app.models.Policy;

GatewayMap.getUniqueId = function(data) {
  return data.id || data.name;
};

Pipeline.getUniqueId = function(data) {
  return data.id || data.name;
};

Policy.getUniqueId = function(data) {
  return data.id || data.name;
};

/**
 * Load all policy-config instances from cache
 * @param cache
 */
function loadFromCache(cache) {
  var maps = GatewayMap.allFromCache(cache);
  var pipelines = Pipeline.allFromCache(cache);
  var policies = Policy.allFromCache(cache);
  maps = maps.map(GatewayMap.getConfigFromData.bind(GatewayMap));
  pipelines = pipelines.map(Pipeline.getConfigFromData.bind(Pipeline));
  policies = policies.map(Policy.getConfigFromData.bind(Policy));
  return {
    maps: maps,
    pipelines: pipelines,
    policies: policies
  };
}

/**
 * Serialize the policy model instances to the JSON object for
 * policy-config.json
 * @param {*[]} cache The cache data source
 * @param {String} facetName Facet name
 * @returns {ConfigFile}
 */
GatewayMap.serialize = function(cache, facetName) {
  var policyConfigPath = path.join(facetName, 'policy-config.json');
  var configs = loadFromCache(cache);

  debug('Writing to policy-config.json: %j', configs);
  return new ConfigFile({
    path: policyConfigPath,
    data: configs
  });
}

/**
 * Load the policy config from the file into cache.
 * @param cache
 * @param facetName
 * @param configFile
 */
GatewayMap.deserialize = function(cache, facetName, configFile) {
  var configs = configFile.data || {};
  configs.policies.forEach(function(p) {
    debug('loading [%s] policy into cache', p.name);
    Policy.addToCache(cache, p);
  });
  configs.pipelines.forEach(function(p) {
    debug('loading [%s] pipeline into cache', p.name);
    Pipeline.addToCache(cache, p);
  });
  configs.maps.forEach(function(m) {
    debug('loading [%s] map into cache', m.name);
    GatewayMap.addToCache(cache, m);
  });
};

