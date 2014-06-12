var assert = require('assert');

function DefinitionFile(file, Definition, cache, definition) {
  this.file = file;
  this.app = app;
  this.Definition = Definition;
  this.cache = cache;
  this.definition = definition;
  var fileCache = this.fileCache = cache.fileCache || (cache.fileCache = {});
  this.data = [];
  if(definition) {
    this.data.push(definition.toJSON());
  }
}

DefinitionFile.toData = function(Definition, rawData) {
  // 
}

DefinitionFile.loadFileCache = function(fileCache, Definition, cb) {
  async.waterfall([
    DefinitionFile.findFiles.bind(DefinitionFile, Definition),
    loadConfigFiles,
    cacheFiles
  ], cb);

  function loadConfigFiles(files, cb) {
    async.each(files, function(file, cb) {
      DefinitionFile.loadFile(file, function(err, rawData) {
        if(err) return cb(err);
        var data = DefinitionFile.toData(Definition, rawData);
        cacheFile(file, data);
        cb();
      });
    }, cb);
  }

  function cacheFile(file, fileData) {
    fileCache[file] = Definition.fromFileData(fileData, file);
  }
}

DefinitionFile.writeFileCacheToDisk = function(fileCache, Definition, cb) {
  async.waterfall([
    DefinitionFile.findFiles.bind(DefinitionFile, Definition),
    removeUnused,
    writeFiles
  ], cb);

  function removeUnused(existingFiles, cb) {
    // clear all files
    async.each(existingFiles, DefinitionFile.removeFile, cb);
  }

  function writeFiles(cb) {
    async.each(Object.keys(fileCache), writeFile, cb);
  }

  function writeFile(file, cb) {
    var fileData = Definition.toFileData(fileCache[file], file);
    DefinitionFile.writeFile(file, fileData, cb);
  }
}

DefinitionFile.findFiles = function(Definition, cb) {

    // flatten list
    var merged = [];
    merged = merged.concat.apply(merged, files);
}

DefinitionFile.prototype._save = function(cb) {
  var current = this.fileCache[this.file] || (this.fileCache[this.file] = []);
  var defFile = this;

  this._embedRelated(function(err) {
    if(err) return cb(err);
    defFile.fileCache[defFile.file] = current.concat(defFile.data);
    cb();
  });
}

DefinitionFile.prototype._addToCache = function(modelName, data) {
  data.configFile = this.file;
  this.cache[modelName] = serialize(data);
}

DefinitionFile.prototype._addAllToCache = function(modelName, arr) {
  arr.forEach(function(data) {
    this._addToCache(modelName, data);
  }.bind(this));
}

DefinitionFile.prototype._load = function() {
  var isMultiple = this.Definition.fileContainsMultipleDefinitions(this.file);
  if(isMultiple) {
    this.loadMultiple();
  } else {
    this.data = this.fileCache[this.file];
  }
  this._loadEmbeded();
  this._addToCache(this.Definition.modelName, data);
}

DefinitionFile.prototype._loadEmbeded = function() {
  var defFile = this;
  var Definition = this.Definition;
  var data = this.data;
  Definition.getEmbededRelations().forEach(function(relation) {
    data.forEach(function(config) {
      var relatedData = Definition.getEmbededData(relation, config);
      defFile._addAllToCache(relation.model, relatedData);
    });
  });
}

DefinitionFile.prototype._embedRelated = function(cb) {
  assert(this.definition);
  var defFile = this;
  var Definition = this.Definition;
  async.each(this.data, embedRelatedForConfig, cb);

  function embedRelatedForConfig(config, cb) {
    async.each(Definition.getEmbededRelations(), get, cb);
    
    function get(relation, cb) {
      var definition = new Definition(config);
      definition[relation.as](function(err, related) {
        if(err) return cb(err);
        config[relation] = Definition.relatedToConfig(relation, related);
        cb();
      });
    }
  }
}

DefinitionFile.fromDefinition = function(definition, cache) {
  return new DefinitionFile(
    definition.getConfigFile(),
    definition.constructor,
    cache,
    definition
  );
}

function serialize(obj) {
  if(obj === null || obj === undefined) {
    return obj;
  }
  return JSON.stringify(obj);
}
