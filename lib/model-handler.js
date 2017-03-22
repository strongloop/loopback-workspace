'use strict';

const workspaceHandler = require('./workspace-handler');
const Model = require('./datamodel/model');
const mixin = require('./util/mixin');
const fsUtility = require('./util/file-utility');
module.exports = ModelHandler;

function ModelHandler(workspace) {
  workspace.registerEvent('modelconfig.create', workspace.addModelConfig);
  workspace.registerEvent('modelconfig.update', workspace.updateModelConfig);
  workspace.registerEvent('modelconfig.refresh', workspace.refreshModelConfig);
  workspace.registerEvent('modelproperty.create', workspace.addModelProperty);
  workspace.registerEvent('modelmethod.create', workspace.addModelMethod);
};

ModelHandler.findAllModels = function(workspace, cb) {
  workspaceHandler.getFileList(workspace, function(err, files) {
    if (err) return cb(err);
    const modelFilePaths = files.Models || [];
    const taskList = [];
    const erroredFiles = [];
    modelFilePaths.forEach(function(filePath) {
      taskList.push(function(next) {
        workspaceHandler.loadModelDefinition(workspace, filePath,
        function(err) {
          if (err)
            erroredFiles.push({file: filePath, error: err});
          next();
        });
      });
    });
    function callback(err) {
      if (err) return cb(err);
      let results = [];
      const models = workspace.getAllModels();
      if (models) {
        Object.keys(models).forEach(function(key) {
          let model = models[key];
          results.push(model.getDefinition());
        });
      }
      results = results.concat(erroredFiles);
      cb(null, results);
    }
    workspace.execute(taskList, callback);
  });
};

class ModelActions {
  create(cb) {
    const workspace = this.getWorkspace();
    const self = this;
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.writeModel(self, next);
    });
    workspace.execute(tasks, cb);
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    const model = this;
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.readModel(
        model.getFacetName(),
        model.getName(),
        workspace,
        function(err, modelDef) {
          if (err) return next(err);
          model.updateDefinition(modelDef);
          next();
        });
    });
    workspace.execute(tasks, cb);
  }
  update(attrs, cb) {
    const workspace = this.getWorkspace();
    const model = this;
    model.set(attrs);
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.writeModel(model, next);
    });
    workspace.execute(tasks, cb);
  }
  delete(cb) {
    const workspace = this.getWorkspace();
    const model = this;
    const err = model.remove();
    if (err) return cb(err);
    fsUtility.removeModel(model, cb);
  }
}

mixin(Model.prototype, ModelActions.prototype);
