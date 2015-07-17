var app = require('../app');
var loopback = require('loopback');
var debug = require('debug')('workspace:policy');
var ConfigFile = app.models.ConfigFile;
var path = require('path');
var async = require('async');

var GatewayMap = app.models.GatewayMap;
var Pipeline = app.models.Pipeline;
var Policy = app.models.Policy;

GatewayMap.getUniqueId = function(data) {
  return data.name || data.id;
};

Pipeline.getUniqueId = function(data) {
  return data.name || data.id;
};

Policy.getUniqueId = function(data) {
  return data.name || data.id;
};

/**
 * Load all policy-config instances from cache
 * @param cache
 */
function loadFromCache(cache) {
  var maps = GatewayMap.allFromCache(cache);
  var pipelines = Pipeline.allFromCache(cache);
  var policies = Policy.allFromCache(cache);
  // var scopes = buildScopes(maps, pipelines, policies);
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
 * Build a set of scopes from maps/pipelines/policies
 * @param {GatewayMap[]) maps
 * @param {Pipeline[]) pipelines
 * @param {Policy[]) policies
 * @returns {{}}
 */
GatewayMap.buildScopes = function(maps, pipelines, policies) {
  var scopes = {};
  maps.forEach(function(m) {
    var matchedPipelines = pipelines.filter(function(pipeline) {
      return m.pipelineId === pipeline.id;
    });
    matchedPipelines.forEach(function(pipeline) {
      var matchedPolicies = policies.filter(function(policy) {
        return policy.type === 'auth' &&
          pipeline.policyIds.indexOf(policy.id) !== -1;
      });
      matchedPolicies.forEach(function(policy) {
        if (policy.scopes) {
          policy.scopes.forEach(function(s) {
            var routes = scopes[s];
            if (!routes) {
              routes = []
              scopes[s] = routes;
            }
            routes.push({verb: m.verb, endpoint: m.endpoint});
          });
        }
      });
    });
  });
  return scopes;
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

/**
 * Get the list of scope mappings
 * @param cb
 */
GatewayMap.getAuthScopes = function(cb) {
  // Find referenced pipeline/policies of type `auth`
  GatewayMap.find({
    include: {
      pipeline: {
        relation: 'policies',
        scope: {
          where: {
            type: 'auth'
          }
        }
      }
    }
  }, function(err, maps) {
    if (err) return cb(err);
    var scopes = {};
    maps.forEach(function(m) {
      var map = m.toJSON();
      if (map.pipeline) {
        if (map.pipeline.policies) {
          map.pipeline.policies.forEach(function(policy) {
            if (policy.scopes) {
              policy.scopes.forEach(function(s) {
                var routes = scopes[s];
                if (!routes) {
                  routes = []
                  scopes[s] = routes;
                }
                routes.push({verb: map.verb, endpoint: map.endpoint});
              });
            }
          });
        }
      }
    });
    cb(null, scopes);
  });
};

/**
 * Find all pipelines that reference the given policy
 * @param {String} name Policy name
 * @param cb
 */
Policy.findPipelineRefs = function(name, cb) {
  Policy.findOne({where: {name: name}}, function(err, policy) {
    if (err) return cb(err);
    Pipeline.find(function(err, pipelines) {
      if (err) return cb(err);
      var matched = pipelines.filter(function(p) {
        return p.policyIds.indexOf(policy.id) !== -1;
      });
      cb(null, {policy: policy, pipelines: matched});
    });
  });
};

/**
 * Rename a policy and adjust pipelines that reference the policy
 * @param {String} currentName Current name
 * @param {String} newName New name
 * @param cb
 */
Policy.rename = function(currentName, newName, cb) {
  if (currentName === newName) {
    return process.nextTick(function() {
      cb(null, false);
    });
  }
  this.findPipelineRefs(currentName, function(err, result) {
    if (err) return cb(err);
    var oldId = result.policy.id;
    result.policy.updateAttributes({name: newName}, function(err, policy) {
      if (err) return cb(err);
      policy.id = Policy.getUniqueId(policy);
      async.each(result.pipelines, function(p, done) {
        var ids = p.policyIds;
        ids.forEach(function(id, index) {
          if (id === oldId) {
            ids[index] = newName;
          }
        });
        p.updateAttributes({policyIds: ids}, done);
      }, function(err) {
        if (err) return cb(err);
        cb(null, policy);
      });
    });
  });
};

/**
 * Find gateway maps that reference the given pipeline
 * @param {String} name The pipeline name
 * @param cb
 */
Pipeline.findMapRefs = function(name, cb) {
  Pipeline.findOne({where: {name: name}}, function(err, pipeline) {
    if (err) return cb(err);
    GatewayMap.find({where: {pipelineId: pipeline.id}}, function(err, maps) {
      if (err) return cb(err);
      cb(null, {pipeline: pipeline, maps: maps});
    });
  });
};

/**
 * Rename a pipeline and adjust the gateway maps that reference the pipeline
 * @param {String} currentName Current name
 * @param {String} newName New Name
 * @param cb
 */
Pipeline.rename = function(currentName, newName, cb) {
  if (currentName === newName) {
    return process.nextTick(function() {
      cb(null, false);
    });
  }
  this.findMapRefs(currentName, function(err, result) {
    if (err) return cb(err);
    result.pipeline.updateAttributes({name: newName}, function(err, pipeline) {
      if (err) return cb(err);
      pipeline.id = Pipeline.getUniqueId(pipeline);
      async.each(result.maps, function(map, done) {
        map.updateAttributes({pipelineId: pipeline.id}, done);
      }, function(err) {
        if (err) return cb(err);
        cb(null, pipeline);
      });
    });
  });
};

Policy.remoteMethod('rename', {
  isStatic: true,
  accepts: [{
    arg: 'currentName',
    type: 'string',
    required: true,
    description: 'Current name'
  },
    {
      arg: 'newName',
      type: 'string',
      required: true,
      description: 'New name'
    }
  ],
  returns: [
    {
      arg: 'policy',
      type: 'Policy',
      root: true
    }
  ]
});

Pipeline.remoteMethod('rename', {
  isStatic: true,
  accepts: [{
    arg: 'currentName',
    type: 'string',
    required: true,
    description: 'Current name'
  },
    {
      arg: 'newName',
      type: 'string',
      required: true,
      description: 'New name'
    }
  ],
  returns: [
    {
      arg: 'pipeline',
      type: 'Pipeline',
      root: true
    }
  ]
});

GatewayMap.remoteMethod('getAuthScopes', {
  isStatic: true,
  accepts: [],
  returns: [
    {
      arg: 'scopes',
      type: 'object',
      root: true
    }
  ],
  http: {
    verb: 'get',
    path: '/authScopes'
  }
});