'use strict';
const DataSource = require('./datamodel/datasource');
const Facet = require('./datamodel/facet');
const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelProperty = require('./datamodel/model-property');
const PackageDefinition = require('./datamodel/package-definition');
const fsUtility = require('./datamodel/util/file-utility');
/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addFacet(id, facetDef, cb) {
    const workspace = this;
    const facet = new Facet(workspace, id, facetDef);
    fsUtility.writeFacet(workspace, facet, cb);
  }
  addModel(modelId, modelDef, cb) {
    const workspace = this;
    // Model is a self-aware node which adds itself to the Workspace graph
    const model = new Model(workspace, modelId, modelDef);
    fsUtility.writeModel(model, cb);
  }
  addModelConfig(modelId, modelConfig, cb) {
    const workspace = this;
    const facet = workspace.getFacet(modelConfig.facetName);
    facet.addModelConfig(workspace, modelId, modelConfig);
    fsUtility.writeModelConfig(facet, cb);
  }
  addDataSource(id, datasource, cb) {
    const workspace = this;
    // Datasource is a self-aware node which adds itself to the Workspace graph
    new DataSource(workspace, id, datasource);
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
  addModelProperty(modelId, propertyName, propertyDef, cb) {
    const workspace = this;
    const id = modelId + '.' + propertyName;
    // ModelProperty is a self-aware node which adds itself to the Workspace graph
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
    fsUtility.writeModel(model, cb);
  }
  addMiddleware(phaseName, path, data, cb) {
    const workspace = this;
    const phase = workspace.getMiddlewarePhase(phaseName);
    phase.addMiddleware(workspace, path, data);
    fsUtility.writeMiddleware(workspace, cb);
  }
  addPackageDefinition(definition, cb) {
    const packageDef = new PackageDefinition(this, 'package.json', definition);
    fsUtility.writePackageDefinition(packageDef, cb);
  }
  refreshModel(modelId, cb) {
    const workspace = this;
    const model = workspace.getModel(modelId);
    const parts = modelId.split('.');
    const facetName = parts[0];
    const modelName = parts[1];
    fsUtility.readModel(facetName, modelName, workspace,
    function(err, modelDef) {
      if (err) return cb(err);
      if (model) {
        model.updateDefinition(modelDef);
        cb(null, model.getDefinition());
      } else {
        workspace.createModelDefinition(modelId, modelDef);
        cb(null, model.getDefinition());
      }
    });
  }
  refreshModelConfig(facetName, cb) {
    const workspace = this;
    const facet = workspace.getFacet(facetName);
    fsUtility.readModelConfig(facet, cb);
  }
  refreshDataSource(cb) {
    const workspace = this;
    fsUtility.readDataSource(workspace, cb);
  }
  refreshMiddleware(cb) {
    const workspace = this;
    fsUtility.readMiddleware(workspace, cb);
  }
};

module.exports = Tasks;
