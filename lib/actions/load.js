'use strict';

const async = require('async');
const fsUtility = require('../util/file-utility');
const lodash = require('lodash');
const mixin = require('../util/mixin');
const path = require('path');
const Workspace = require('../workspace');
const DataSource = require('../datamodel/datasource');
const Model = require('../datamodel/model');
const ModelConfig = require('../datamodel/model-config');
const Facet = require('../datamodel/facet');
const FacetConfig = require('../datamodel/facet-config');

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
  refreshModels(cb) {
    const workspace = this;
    this.fileList(function(err, files) {
      if (err) return cb(err);
      const taskList = [];
      files.Models.forEach(filePath=> {
        taskList.push(workspace.loadModel.bind(workspace, filePath));
      });
      async.series(taskList, cb);
    });
  }
  loadFacet(filePath, cb) {
    const workspace = this;
    const dir = path.join(workspace.getDirectory(), filePath);
    const facetName = path.dirname(filePath);
    let facet = new Facet(workspace, facetName, {});
    workspace.add(facet);
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
    if (workspace.model(id))
      return cb(new Error('Model is already loaded'));
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      const model = new Model(workspace, id, fileData);
      workspace.add(model);
      cb();
    });
  }
  loadModelConfig(filePath, cb) {
    const workspace = this;
    const facetName = path.dirname(filePath);
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, config) {
      if (err) return cb(err);
      const facet = workspace.facet(facetName);
      Object.keys(config).forEach(function(key) {
        if (key === '_meta') return;
        let modelConfig = facet.modelconfig(key);
        if (modelConfig) {
          modelConfig._content = config[key];
        } else {
          facet.setModelConfig(key, config[key]);
        }
      });
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
    const facet = this.facets(facetName);
    filePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(filePath, function(err, fileData) {
      if (err) return cb(err);
      const facet = workspace.facets(facetName);
      const datasources = facet.datasources();
      Object.keys(fileData).forEach(function(key) {
        let ds = datasources.get(key);
        if (ds) {
          ds.set(fileData[key]);
        } else {
          const datasource = new DataSource(workspace, key, fileData[key]);
          facet.add(datasource);
        }
      });
      cb();
    });
  }
}

mixin(Workspace.prototype, WorkspaceActions.prototype);
