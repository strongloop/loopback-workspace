'use strict';

const fsUtility = require('./util/file-utility');
const Workspace = require('./workspace');

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
    facetConfigFiles.forEach((filePath)=> {
      taskList.push(workspace.loadFacet.bind(filePath));
    });
    modelFiles.forEach((filePath)=> {
      taskList.push(workspace.loadModel.bind(filePath));
    });
    dataSourceFiles.forEach((filePath)=> {
      taskList.push(workspace.loadDataSources.bind(filePath));
    });
    modelConfigFiles.forEach((filePath)=> {
      taskList.push(workspace.loadModelConfig.bind(filePath));
    });
    middlewareFiles.forEach((filePath)=> {
      taskList.push(workspace.loadMiddleware.bind(filePath));
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
    filePath = path.join(workspace.getDirectory(), filePath);
    const dir = path.dirname(filePath);
    const facetName = dir.split('/').join('.');
    const fileName = path.basename(filePath, 'json');
    const modelName = lodash.capitalize(lodash.camelCase(fileName));
    const id = facetName + '.' + modelName;
    if (workspace.getModel(id))
      return cb(new Error('Model is already loaded'));
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
