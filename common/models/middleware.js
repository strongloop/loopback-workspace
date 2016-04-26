// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../../server/server');

module.exports = function(Middleware) {
  app.once('ready', function() {
    ready(Middleware);
  });
};

function ready(Middleware) {
  var loopback = require('loopback');
  var debug = require('debug')('workspace:middleware');
  var ConfigFile = app.models.ConfigFile;
  var path = require('path');
  var stableSortInPlace = require('stable').inplace;

  /**
   * Defines a `Middleware` configuration.
   * @class Middleware
   * @inherits Definition
   */

  /**
   * - `facetName` is required and must refer to an existing facet
   *
   * @header Property Validation
   */
  Middleware.validatesPresenceOf('facetName');

  function getPhase(name) {
    if (name == null) {
      return name;
    }
    var parts = name.split(':');
    return parts[0];
  }

  /**
   * Get all phases by name
   * @param {Function} cb Callback function
   */
  Middleware.getPhases = function(cb) {
    // Load all entries from cache and sort them by order
    Middleware.find(function(err, instances) {
      if (err) return cb(err);
      var phases = sortMiddleware(instances).phases;
      cb(null, phases);
    });
  };

  var ORDER_BUFFER = 1024;

  /**
   * Add a middleware phase to the cache in a slot after the `nextPhase`
   * @param {String} facetName
   * @param {String} phase
   * @param {String} nextPhase
   */
  Middleware.addPhase = function(facetName, phase, nextPhase, cb) {
    phase = getPhase(phase);
    nextPhase = getPhase(nextPhase);

    this.getPhases(function(err, phases) {
      if (err) return cb(err);

      var order, prevOrder;
      for (var i = phases.length - 1; i >= 0; i--) {
        if (phases[i].phase === phase) {
          // The phase exists
          return cb(null, false);
        }
        if (order == null && phases[i].phase === nextPhase) {
          if (i > 0) {
            prevOrder = phases[i - 1].order;
          } else {
            prevOrder = 0;
          }
          // Set the order against the next phase
          order = (phases[i].order + prevOrder) / 2;
        }
      }

      if (order == null) {
        if (phases.length > 0) {
          order = phases[phases.length - 1].order + ORDER_BUFFER;
        } else {
          order = ORDER_BUFFER;
        }
      }
      var phasePlaceHolder = {
        phase: phase,
        isPhasePlaceHolder: true,
        order: order,
        facetName: facetName,
        name: '*' + phase, // Set the name to be unique
      };
      debug('Adding phase %s before %s: %j', phase, nextPhase, phasePlaceHolder);
      Middleware.create(phasePlaceHolder, cb);
    });
  };

  Middleware.addMiddleware = function(m, cb) {
    var self = this;
    this.addPhase(m.facetName, m.phase, m.nextPhase, function(err, p) {
      if (err) return cb(err);
      if (m.isPhasePlaceHolder) return cb(null, p);
      self.create(m, cb);
    });
  };

  function compareByOrder(m1, m2) {
    if (m1.order == null && typeof m2.order === 'number') {
      return 1;
    }
    if (m2.order == null && typeof m1.order === 'number') {
      return -1;
    }
    var diff = m1.order - m2.order;
    if (isNaN(diff) || diff === 0) {
      diff = 0;
    }
    return diff > 0 ? 1 : -1;
  }

  var subPhaseOrders = {
    before: 1,
    regular: 2,
    after: 3,
  };

  function compareBySubPhase(m1, m2) {
    var sp1 = m1.subPhase || 'regular';
    var sp2 = m2.subPhase || 'regular';
    return subPhaseOrders[sp1] - subPhaseOrders[sp2];
  }

  function sortMiddleware(instances) {
    // Find all phases
    var phases = instances.filter(function(m) {
      return m.isPhasePlaceHolder;
    });

    // Find regular middleware entries
    var middleware = instances.filter(function(m) {
      return !m.isPhasePlaceHolder;
    });

    // Sort the entries to keep the order
    stableSortInPlace(phases, compareByOrder);

    // Build a map for phase orders (phaseName --> phaseOrder)
    var phaseOrders = {};
    phases.forEach(function(p) {
      phaseOrders[p.phase] = p.order;
    });

    stableSortInPlace(middleware, function(m1, m2) {
      // First by phase
      var delta = phaseOrders[m1.phase] - phaseOrders[m2.phase];
      if (delta !== 0) return (delta > 0 ? 1 : -1);
      // by subPhase
      delta = compareBySubPhase(m1, m2);
      if (delta !== 0) return (delta > 0 ? 1 : -1);
      // By order
      return compareByOrder(m1, m2);
    });
    return {
      phases: phases,
      middleware: middleware,
    };
  }

  /**
   * Load all middleware instances from cache and sort them by order
   * @param cache
   */
  function loadFromCache(cache) {
    var instances = Middleware.allFromCache(cache);
    var results = sortMiddleware(instances);
    var phases = results.phases;
    var middleware = results.middleware;
    phases.forEach(function(p) {
      var entries = middleware.filter(function(m) {
        return p.phase === m.phase;
      });
      entries.forEach(function(m) {
        var subPhase = m.subPhase || 'regular';
        p[subPhase] = p[subPhase] || [];
        p[subPhase].push(m);
      });
    });
    return phases;
  }

  /**
   * Serialize the middleware model instances to the JSON object for
   * middleware.json
   * @param {*[]} cache The cache data source
   * @param {String} facetName Facet name
   * @returns {ConfigFile}
   */
  Middleware.serialize = function(cache, facetName) {
    var middlewarePath = path.join(facetName, 'middleware.json');
    var phases = loadFromCache(cache);
    var middlewareConfig = {};

    function addEntries(phase, subPhase, entries) {
      if (Array.isArray(entries)) {
        entries.forEach(function(m) {
          var phaseName = phase;
          if (subPhase) phaseName = phaseName + ':' + subPhase;
          var phaseDef = middlewareConfig[phaseName];
          if (!phaseDef) {
            phaseDef = {};
            middlewareConfig[phaseName] = phaseDef;
          }
          if (m.isMiddlewarePlaceHolder) {
            phaseDef[m.name] = [];
          } else {
            var def = phaseDef[m.name];
            if (def) {
              // The name already has an entry, convert the value to array
              if (!Array.isArray(def)) {
                def = [def];
              }
              phaseDef[m.name] = def;
              def.push(Middleware.getConfigFromData(m));
            } else {
              phaseDef[m.name] = Middleware.getConfigFromData(m);
            }
          }
        });
        return entries.length;
      }
      return 0;
    }

    phases.forEach(function(p) {
      if (p.facetName === facetName) {
        var count = 0;
        count += addEntries(p.phase, 'before', p.before);
        count += addEntries(p.phase, '', p.regular);
        count += addEntries(p.phase, 'after', p.after);
        if (count === 0) {
          middlewareConfig[p.phase] = {};
        }
      }
    });

    debug('Writing to middleware.json: %j', middlewareConfig);
    if (Object.keys(middlewareConfig).length) {
      return new ConfigFile({
        path: middlewarePath,
        data: middlewareConfig,
      });
    } else {
      return null;
    }
  };

  /**
   * Load the middleware config from the file into cache. Each phase will have
   * a place holder and each middleware entry will have a record
   * @param cache
   * @param facetName
   * @param configFile
   */
  Middleware.deserialize = function(cache, facetName, configFile) {
    var middlewareDefs = configFile.data || {};

    var phases = Object.keys(middlewareDefs);

    var phaseOrder = 0;
    phases.forEach(function(phaseKey) {
      phaseOrder++;
      var order = 0;
      var defs = middlewareDefs[phaseKey];

      var parts = phaseKey.split(':');
      var phase = parts[0];
      var subPhase = parts[1];

      // Keep the phase information by adding an empty middleware config
      var def = {
        configFile: configFile.path,
        phase: phase,
        isPhasePlaceHolder: true,
        order: phaseOrder * ORDER_BUFFER + order,
        facetName: facetName,
        name: '*' + phase, // Set the name to be unique
      };
      Middleware.addToCache(cache, def);

      for (var d in defs) {
        def = defs[d];
        var defList = def;
        if (!Array.isArray(def)) {
          defList = [def];
        }
        if (defList.length === 0) {
          defList = [{ isMiddlewarePlaceHolder: true }];
        }
        // The middleware value can be an array
        for (var i = 0, n = defList.length; i < n; i++) {
          order++;
          var md = defList[i];
          md.configFile = configFile.path;
          md.phase = phase;
          md.subPhase = subPhase;
          md.facetName = facetName;
          md.name = d;
          md.order = phaseOrder * ORDER_BUFFER + order;
          md.index = i;
          debug('loading [%s] middleware into cache: %j', md.name, md);
          Middleware.addToCache(cache, md);
        }
      }
    });
  };

  Middleware.getUniqueId = function(data) {
    var phase = data.phase;
    if (data.subPhase) {
      phase = phase + ':' + data.subPhase;
    }
    var index = '';
    if (data.index) {
      index = '.' + data.index.toString();
    }
    return phase + '.' + data.name + index;
  };
}
