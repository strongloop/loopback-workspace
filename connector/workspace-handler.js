'use strict';

const fsUtility = require('../component/datamodel/util/file-utility');
const path = require('path');

class WorkspaceHandler {
  static getLoadTasks(workspace, files, erroredFiles) {
    const handler = WorkspaceHandler;
    const taskList = [];
    const modelFiles = files.Models || [];
    const modelConfigFiles = files.ModelConfig || [];
    const dataSourceFiles = files.DataSources || [];
    const middlewareFiles = files.Middleware || [];
    const facetConfigFiles = files.FacetConfig || [];

    facetConfigFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadFacet(workspace, filePath, erroredFiles, next);
      });
    });
    modelFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadModelDefinition(workspace, filePath, erroredFiles, next);
      });
    });
    dataSourceFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadDataSources(workspace, filePath, erroredFiles, next);
      });
    });
    modelConfigFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadModelConfig(workspace, filePath, erroredFiles, next);
      });
    });
    middlewareFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadMiddleware(workspace, filePath, erroredFiles, next);
      });
    });
    return taskList;
  }
  static getFileList(workspace, cb) {
    fsUtility.getConfigFiles(workspace.directory, cb);
  }
  static loadWorkspace(workspace, cb) {
    const erroredFiles = [];
    let taskList = [];
    WorkspaceHandler.getFileList(workspace, function(err, files) {
      taskList = WorkspaceHandler.getLoadTasks(workspace, files, erroredFiles);
      function callback(err, results) {
        if (err) return cb(err);
        const response = {workspaceId: workspace.getId()};
        response.errors = erroredFiles;
        cb(null, response);
      };
      workspace.execute(taskList, callback);
    });
  }
  static loadModelDefinition(workspace, filePath, erroredFiles, next) {
    const modelFilePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(modelFilePath, function(err, fileData) {
      if (err) return next(err);
      workspace.loadModel(filePath, fileData, function(err) {
        if (err) erroredFiles.push(err);
        next();
      });
    });
  }
  static loadDataSources(workspace, filePath, erroredFiles, next) {
    workspace.loadDataSources(filePath, function(err) {
      if (err) erroredFiles.push(err);
      next();
    });
  }
  static loadModelConfig(workspace, filePath, erroredFiles, next) {
    workspace.loadModelConfig(filePath, function(err) {
      if (err) erroredFiles.push(err);
      next();
    });
  }
  static loadMiddleware(workspace, filePath, erroredFiles, next) {
    workspace.loadMiddleware(filePath, function(err) {
      if (err) erroredFiles.push(err);
      next();
    });
  }
  static loadFacet(workspace, filePath, erroredFiles, next) {
    workspace.loadFacet(filePath, function(err) {
      if (err) erroredFiles.push(err);
      next();
    });
  }
}

module.exports = WorkspaceHandler;
