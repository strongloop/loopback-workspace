'use strict';
const fsUtility = require('../component/datamodel/util/file-utility');
class WorkspaceHandler {
  static loadWorkspace(workspace, cb) {
    const dataSourceFiles = [];
    const erroredFiles = [];
    const handler = WorkspaceHandler;
    const modelFiles = [];
    const modelConfigFiles = [];
    const middlewareFiles = [];
    const taskList = [];
    taskList.push(function(next) {
      fsUtility.getConfigFiles(workspace.directory, function(err, files) {
        if (err) return next(err);
        modelFiles.concat(files['Models']);
        modelConfigFiles.concat(files['ModelConfig']);
        dataSourceFiles.concat(files['DataSources']);
        middlewareFiles.concat(files['Middleware']);
        next();
      });
    });
    modelFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadModelDefinitions(workspace, filePath, erroredFiles, next);
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
    function callback(err, results) {
      if (err) return cb(err);
      const response = {workspaceId: workspace.getId()};
      response.errors = erroredFiles;
      cb(null, response);
    };
    workspace.execute(taskList, callback);
  }
  static loadModelDefinition(workspace, filePath, erroredFiles, next) {
    fsUtility.readFile(filePath, function(err, fileData) {
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
}

module.exports = WorkspaceHandler;
