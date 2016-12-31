'use strict';
const DataSource = require('./datamodel/datasource');
const Model = require('./datamodel/model');
const ModelProperty = require('./datamodel/model-property');
const fsWriter = require('./datamodel/util/write');
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
    fsWriter.writeModel(model, cb);
  }
  addDataSource(id, datasource, cb) {
    const workspace = this;
    //Datasource is a self-aware node which adds itself to the Workspace graph
    new DataSource(workspace, id, datasource);
    fsWriter.writeDataSourceConfig(workspace, cb);
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
  addModelRelation(relationName, fromModelId, toModelId, data, cb) {
    const workspace = this;
    const model = workspace.getModel(fromModelId);
    const relation = model.addRelation(relationName, toModelId, data);
    model.setRelation(relationName, relation);
    fsWriter.writeModel(model, cb);
  }
  addMiddleware(phaseName, path, data, cb) {
    const workspace = this;
    const phase = workspace.getMiddlewarePhase(phaseName);
    phase.addMiddleware(workspace, path, data);
    fsWriter.writeMiddleware(workspace, cb);
  }
};

module.exports = Tasks;
