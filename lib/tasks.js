'use strict';
const config = require('./config');
const DataSource = require('./datamodel/datasource');
const Facet = require('./datamodel/facet');
const fsUtility = require('./util/file-utility');
const lodash = require('lodash');
const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelMethod = require('./datamodel/model-method');
const ModelProperty = require('./datamodel/model-property');
const MiddlewarePhase = require('./datamodel/middleware-phase');
const PackageDefinition = require('./datamodel/package-definition');
const path = require('path');

/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addFacet(name, facetDef, cb) {
    const workspace = this;
    const facet = new Facet(workspace, name, facetDef.modelsMetaData);
    if (facetDef.settings) {
      facet.addConfig(facetDef.settings);
    }
    config.defaultModelConfig.forEach(function(modelConfig) {
      facet.addModelConfig(workspace, modelConfig.name, modelConfig);
    });
    fsUtility.writeFacet(workspace, facet, cb);
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
    model.setProperty(property);
    fsUtility.writeModel(model, cb);
  }
  addModelMethod(modelId, methodName, methodDef, cb) {
    const workspace = this;
    const id = modelId + '.' + methodName;
    // ModelMethod is a self-aware node which adds itself to the Workspace graph
    const method = new ModelMethod(workspace, id, methodDef);
    const model = workspace.getModel(modelId);
    model.setMethod(method);
    fsUtility.writeModel(model, cb);
  }
  addModelRelation(relationName, fromModelId, toModelId, data, cb) {
    const workspace = this;
    const model = workspace.getModel(fromModelId);
    const relation = model.addRelation(relationName, toModelId, data);
    fsUtility.writeModel(model, cb);
  }
  addMiddleware(phaseName, path, data, cb) {
    const workspace = this;
    const phase = workspace.getMiddlewarePhase(phaseName);
    phase.addMiddleware(workspace, path, data);
    fsUtility.writeMiddleware(workspace, cb);
  }
  addMiddlewarePhase(phaseName, index, before, cb) {
    const workspace = this;
    const phaseArr = [phaseName + ':before', phaseName, phaseName + ':after'];
    const existingPhase = this.middlewarePhases.find(function(value) {
      if (value === phaseName) {
        return true;
      }
      return false;
    });
    if (existingPhase) {
      return cb(new Error('phase exists already'));
    }
    if (index === -1) {
      index = this.middlewarePhases.length;
    }
    if (before) {
      this.middlewarePhases.find(function(value, i) {
        if (value.startsWith(before)) {
          index = i;
          return true;
        }
        return false;
      });
    }
    if (index && index < this.middlewarePhases.length) {
      phaseArr.forEach(function(phase) {
        this.middlewarePhases.splice(index++, 0, phase);
        new MiddlewarePhase(workspace, phase);
      }, this);
      fsUtility.writeMiddleware(workspace, cb);
      return;
    }
    phaseArr.forEach(function(phase) {
      this.middlewarePhases.push(phase);
      new MiddlewarePhase(workspace, phase);
    }, this);
    fsUtility.writeMiddleware(workspace, cb);
  }
  addPackageDefinition(definition, cb) {
    const packageDef = new PackageDefinition(this, 'package.json', definition);
    fsUtility.writePackageDefinition(packageDef, cb);
  }
  refreshDataSource(cb) {
    const workspace = this;
    fsUtility.readDataSource(workspace, cb);
  }
  refreshMiddleware(cb) {
    const workspace = this;
    fsUtility.readMiddleware(workspace, cb);
  }
  updateDataSource(id, config, cb) {
    const workspace = this;
    const dataSource = workspace.getDataSource(id);
    dataSource.set(config);
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
  loadFacet(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    const dir = path.join(workspace.getDirectory(), filePath);
    let facet = workspace.getFacet(facetName);
    if (!facet)
      facet = new Facet(workspace, facetName, {});
    fsUtility.readFile(dir, function(err, fileData) {
      if (err) return cb(err);
      facet.addConfig(facetName, fileData);
      cb();
    });
  }
  loadModel(filePath, fileData, cb) {
    const workspace = this;
    const dir = path.dirname(filePath);
    const facetName = dir.split('/').join('.');
    const fileName = path.basename(filePath, 'json');
    const modelName = lodash.capitalize(lodash.camelCase(fileName));
    const id = facetName + '.' + modelName;
    if (workspace.getModel(id))
      return cb(new Error('Model is already loaded'));
    new Model(workspace, id, fileData);
    cb();
  }
  loadModelConfig(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    const dir = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(dir, function(err, fileData) {
      if (err) return cb(err);
      const facet = workspace.getFacet(facetName);
      facet.setModelConfig(fileData);
      cb();
    });
  }
  loadMiddleware(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    const dir = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(dir, function(err, fileData) {
      if (err) return cb(err);
      workspace.setMiddlewareConfig(fileData);
      cb();
    });
  }
  loadDataSources(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    const dir = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(dir, function(err, fileData) {
      if (err) return cb(err);
      workspace.setDatasources(fileData);
      cb();
    });
  }
  removeModelRelation(modelId, relationName, cb) {
    const workspace = this;
    const model = workspace.getModel(modelId);
    model.removeRelation(relationName);
    fsUtility.writeModel(model, cb);
  }
};

module.exports = Tasks;
