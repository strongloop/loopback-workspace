'use strict';

const DataSource = require('../datamodel/datasource');
const Facet = require('../datamodel/facet');
const fsUtility = require('../util/file-utility');
const lodash = require('lodash');
const mixin = require('../util/mixin');
const Model = require('../datamodel/model');
const ModelConfig = require('../datamodel/model-config');
const ModelMethod = require('../datamodel/model-method');
const ModelProperty = require('../datamodel/model-property');
const MiddlewarePhase = require('../datamodel/middleware-phase');
const PackageDefinition = require('../datamodel/package-definition');
const path = require('path');
const Workspace = require('../workspace');

class WorkspaceActions {
  loadAll(cb) {
    const workspace = this;
    this.fileList(function(err, files) {
      const taskList = workspace.loadTasks(files);
      workspace.execute(taskList, cb);
    });
  }
  fileList(cb) {
    fsUtility.getConfigFiles(this.directory, function(err, files) {
      if (err) return cb(err);
      files.Models = files.Models || [];
      files.ModelConfig = files.ModelConfig || [];
      files.DataSources = files.DataSources || [];
      files.Middleware = files.Middleware || [];
      files.FacetConfig = files.FacetConfig || [];
      cb(null, files);
    });
  }
  loadTasks(files) {
    const workspace = this;
    const taskList = [];
    files.FacetConfig.forEach(filePath=> {
      taskList.push(workspace.loadFacet.bind(workspace, filePath));
    });
    files.Models.forEach(filePath=> {
      taskList.push(workspace.loadModel.bind(workspace, filePath));
    });
    files.DataSources.forEach(filePath=> {
      taskList.push(workspace.loadDataSources.bind(workspace, filePath));
    });
    files.ModelConfig.forEach(filePath=> {
      taskList.push(workspace.loadModelConfig.bind(workspace, filePath));
    });
    files.Middleware.forEach(filePath=> {
      taskList.push(workspace.loadMiddleware.bind(workspace, filePath));
    });
    return taskList;
  }
  loadFacet(filePath, cb) {
    const workspace = this;
    const dir = path.join(workspace.getDirectory(), filePath);
    const facetName = path.dirname(filePath);
    let facet = workspace.getFacet(facetName);
    if (!facet)
      facet = new Facet(workspace, facetName, {});
    fsUtility.readFile(dir, function(err, fileData) {
      if (err) return cb(err);
      facet.addConfig(facetName, fileData);
      cb();
    });
  }
  loadModel(filePath, cb) {
    const workspace = this;
    const dir = path.dirname(filePath);
    const facetName = dir.split('/').join('.');
    const fileName = path.basename(filePath, 'json');
    const modelName = lodash.capitalize(lodash.camelCase(fileName));
    const id = facetName + '.' + modelName;
    if (workspace.getModel(id))
      return cb(new Error('Model is already loaded'));
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      new Model(workspace, id, fileData);
      cb();
    });
  }
  loadModelConfig(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      if (err) return cb(err);
      const facet = workspace.getFacet(facetName);
      facet.setModelConfig(fileData);
      cb();
    });
  }
  loadMiddleware(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      if (err) return cb(err);
      workspace.setMiddlewareConfig(fileData);
      cb();
    });
  }
  loadDataSources(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      if (err) return cb(err);
      workspace.setDatasources(fileData);
      cb();
    });
  }
}

mixin(Workspace.prototype, WorkspaceActions.prototype);
