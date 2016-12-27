'use strict';
const Model = require('./datamodel/model');
const ModelProperty = require('./datamodel/model-property');
const DataSource = require('./datamodel/datasource');
const WriteOperations = require('./datamodel/util/write');
/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addModel(modelId, modelDef, cb) {
    const workspace = this;
    //Model is a self-aware node which adds itself to the Workspace graph
    const model = new Model(workspace, modelId, modelDef);
    WriteOperations.writeModel(model, cb);
  }
  addDataSource(id, datasource, cb) {
    const workspace = this;
    //Datasource is a self-aware node which adds itself to the Workspace graph
    new DataSource(workspace, id, datasource);
    WriteOperations.writeDataSourceConfig(workspace, cb);
  }
  addModelProperty(modelId, propertyName, propertyDef, cb) {
    const workspace = this;
    const id = modelId + '.' + propertyName;
    //ModelProperty is a self-aware node which adds itself to the Workspace graph
    const property = new ModelProperty(workspace, id, propertyDef);
    const model = workspace.getModel(modelId);
    model.setProperty(propertyName, property);
    cb(null, propertyDef);
  }
};

module.exports = Tasks;
