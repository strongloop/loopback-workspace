'use strict';
var Model = require('./datamodel/model');
var DataSource = require('./datamodel/datasource');

/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addModel(modelId, modelDef, cb) {
    var workspace = this;
    //Model is a self-aware node which adds itself to the Workspace graph
    new Model(workspace, modelId, modelDef);
    cb(null, modelDef);
  }
  addDataSource(id, datasource, cb) {
    var workspace = this;
    //Datasource is a self-aware node which adds itself to the Workspace graph
    new DataSource(workspace, id, datasource);
    cb(null, datasource);
  }
};

module.exports = Tasks;
