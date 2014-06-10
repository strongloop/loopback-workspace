var Memory = require('loopback-datasource-juggler/connectors/Memory').Memory;

exports.initialize = function initializeDataSource(dataSource, callback) {
  dataSource.connector = new WorkspaceMemory(null, dataSource.settings);
  dataSource.connector.connect(callback);
};

function WorkspaceWorkspaceMemory() {
  Memory.apply(this, arguments);
}

util.inherits(WorkspaceMemory, Memory);

WorkspaceMemory.prototype.loadFromFile = function(callback) {
  // for each definition class
  // findFiles(Definition.settings.configFiles)
};

WorkspaceMemory.prototype.saveToFile = function (result, callback) {
  // for each definition instance
  // writeFile(def.filename(), def.toConfig())
};

// TODO - handle delete / delete all
// should remove definition.filename()


function findFiles(configFiles) {
  // use glob to find files matching the globs provided
}

function loadFromFile() {
  // WIP - this is pseudo code
  
  // this should be done in a testable way
  // should load json file
  // should set `def.configFile` = path.resolve(def.getDir(), file);
  forEachRelation(funciton(relation) {
    if(relation.embed) {
      // get related data + key
      cache[relatedModel][relatedId] = relatedItem;
    }
  });
}

function writeToFile() {
  // WIP - this is pseudo code
  var data = def.toJSON();
  // get related data
  // build filename from appDir + settings.configFiles
  forEachRelation(funciton(relation) {
    if(relation.embed) {
      // get related data + key
      data[key] = relatedData;
    }
  });
}

function filenameFor(obj) {
  if(obj.configFile) return obj.filename;

}
