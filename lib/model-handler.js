'use strict';

const workspaceHandler = require('./workspace-handler');

module.exports = ModelHandler;

function ModelHandler(workspace) {
  workspace.registerEvent('model.create', workspace.addModel);
  workspace.registerEvent('model.refresh', workspace.refreshModel);
  workspace.registerEvent('model.update', workspace.updateModel);
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
