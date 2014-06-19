var loopback = require('loopback');
var path = require('path');
var app = require('../app');

/**
 * Base class for LoopBack definitions.
 *
 * @class Definition
 * @inherits WorkspaceEntity
 */

var Definition = app.model('Definition', {
  "properties": {
    "name": {
      "type": "string",
      "id": true,
      "required": true
    },
    "dir": {
      "type": "string",
      "desc": "the directory name where the definition is persisted"
    }
  },
  "public": false,
  "dataSource": "db",
  "options": {
    "base": "WorkspaceEntity"
  }
});

Definition.findFiles = function(patterns, cb) {
  this.findFilesIn('.', patterns, cb);
}

Definition.findFilesIn = function(dir, patterns, cb) {
  glob(patterns, { cwd: Definition.absolutePathFor(dir) }, cb);
}

Definition.findRelativeFiles = function(root, paths, name, extensions, cb) {
  var patterns = [];
  paths.forEach(function(pattern) {
    var file = path.join(pattern, name);
    extensions.forEach(function(ext) {
      patterns.push(file + ext);
    });
  });
  this.findFilesIn(root, patterns, cb);
}

Definition.absolutePathFor = function(file) {
  var workspaceDir = process.env.WORKSPACE_DIR || process.cwd();
  return path.join(workspaceDir, file);
}

Definition.loadDefinitionsFromFs = function() {
  var Definition = this;

  // find apps in the workspace
  async.waterfall([
    AppDefinition.findAppDirs,
    loadConfigs,
    cacheConfigs
  ]);

  function loadConfigs(appDirs, cb) {
    async.map(appDirs, loadConfig, cb);
  }

  function loadConfig(dir, cb) {
    var file = path.join(dir, Definition.settings.defaultConfigFile);
    Definition.loadFile(file, function(err, config) {
      if(err) return cb(err);
      if(config) {
        config._configFile = file;
      } else {
        config = {};
      }
      config.dir = dir;
      cb(null, config);
    });
  }

  function cacheConfigs(configs, cb) {
    async.each(configs, function(config) {
      Definition.populateCacheFromConfig(config, cb);
    });
  }
}
Definition.saveToFs = function(defs, cb) {
  // 
}

Definition.clearCache = function() {
  this.dataSource.connector.cache[this.modelName] = {};
  this.dataSource.connector.ids[this.modelName] = {};
}

Definition.addToCache = function(id, val) {
  this.dataSource.connector.cache[this.modelName][id] = val;
}

Definition.findAppFiles = function(patterns, cb) {
  async.waterfall([
    Definition.findAppDirs,
    function(dirs, cb) {
      async.each(dirs, function() {

      })
    }
  ], cb);
  glob(patterns, cb);
}

Definition.findAppDirs = function(cb) {
  async.waterfall([
    findModelsJSON,
    function(modelFiles) {
      cb(null, modelFiles.map(function(file) {
        return path
          .dirname(file)
          .replace(WORKSPACE_DIR, '');
      }));
    }
  ], cb);

  function findModelsJSON(cb) {
    var modelConfigFileName = 'models.json';
    var nested = path.join('*', modelConfigFileName);
    var root = modelConfigFileName;

    Definition.findFiles([nested, root], cb);
  }
}

Definition.getRelatedModels = function() {
  var relations = this.settings.relations || {};
  var models = [];

  Object.keys(relations).forEach(function(modelName) {
    loopback
  });

  return models;
}

Definition.setup = function() {
  var Base = loopback.Model;
  var Definition = this;
  Base.setup.apply(this, arguments);
  Definition.on('dataSourceAttached', function() {
    var originalFind = Definition.find;
    Definition.findFromCache = originalFind;

    // ensure we are finding data from disk
    Definition.find = function() {
      var args = arguments;
      var self = this;
      var cb = args[args.length - 1];
      if(typeof cb !== 'function') cb = noop;

      Definition.loadDefinitionsFromFs(function(err) {
        if(err) return cb(err);
        originalFind.apply(self, args);
      });
    }
  });

  function setupHooks(Model) {
    Model.afterSave = function(inst, next) {
      Definition.findFromCache(function(err, definitions) {
        if(err) return next(err);
        Definition.saveToFs(inst, definitions, next);
      });
    }
    Model.beforeDestroy = function(inst, next) {
      Definition.removeFromFs(inst, next);
    }
  }
}

Definition.toArray = function(obj) {
  if(!obj) return [];
  if(Array.isArray(obj)) {
    return obj;
  }


}

Definition.getEmbededRelations = function() {
  var relations = this.settings.relations;
  var results = [];
  
  if(relations) {
    Object
      .keys(relations)
      .forEach(function(name) {
        var relation = relations[name];
        if(relation.embed) {
          results.push({
            model: relation.model,
            as: name
          });
        }
      });
  }

  return results;
}

Definition.addRelatedDataToCache = function(name, fileData, cb) {
  var Definition = this;
  try {
    this.getEmbededRelations().forEach(function(relation) {
      Definition.toArray(fileData[relation.as]).forEach(function(config) {
        Definition.addToModelCache(relation.model, config);
      });
    });
  } catch(e) {
    return cb(e);
  }

  cb();
}

function noop() {};

