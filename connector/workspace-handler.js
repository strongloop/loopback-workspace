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
        handler.loadFacet(workspace, filePath, function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
      });
    });
    modelFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadModelDefinition(workspace, filePath, function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
      });
    });
    dataSourceFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadDataSources(workspace, filePath, function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
      });
    });
    modelConfigFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadModelConfig(workspace, filePath, function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
      });
    });
    middlewareFiles.forEach(function(filePath) {
      taskList.push(function(next) {
        handler.loadMiddleware(workspace, filePath, function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
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
  static loadModelDefinition(workspace, filePath, cb) {
    const modelFilePath = path.join(workspace.getDirectory(), filePath);
    fsUtility.readFile(modelFilePath, function(err, fileData) {
      if (err) return cb(err);
      workspace.loadModel(filePath, fileData, cb);
    });
  }
  static loadDataSources(workspace, filePath, cb) {
    workspace.loadDataSources(filePath, cb);
  }
  static loadModelConfig(workspace, filePath, cb) {
    workspace.loadModelConfig(filePath, cb);
  }
  static loadMiddleware(workspace, filePath, cb) {
    workspace.loadMiddleware(filePath, cb);
  }
  static loadFacet(workspace, filePath, cb) {
    workspace.loadFacet(filePath, cb);
  }
}

module.exports = WorkspaceHandler;
