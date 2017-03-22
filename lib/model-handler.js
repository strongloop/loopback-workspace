'use strict';

const workspaceHandler = require('./workspace-handler');
const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelProperty = require('./datamodel/model-property');
const ModelMethod = require('./datamodel/model-method');
const mixin = require('./util/mixin');
const fsUtility = require('./util/file-utility');

module.exports.findAllModels = function(workspace, cb) {
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

class ModelConfigActions {
  create(modelId, facetName, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.getFacet(facetName);
    const modelConfig = this;
    facet.addModelConfig(modelConfig);
    fsUtility.writeModelConfig(facet, cb);
  }
  update(facet, modelId, attrs, cb) {
    const workspace = this.getWorkspace();
    const modelConfig = this;
    modelConfig.set(attrs);
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.writeModelConfig(facet, next);
    });
    workspace.execute(tasks, cb);
  }
}

mixin(ModelConfig.prototype, ModelConfigActions.prototype);

class ModelPropertyActions {
  create(modelId, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.getModel(modelId);
    model.setProperty(this);
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.writeModel(model, next);
    });
    workspace.execute(tasks, cb);
  }
}

mixin(ModelProperty.prototype, ModelPropertyActions.prototype);

class ModelMethodActions {
  create(modelId, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.getModel(modelId);
    model.setMethod(this);
    const tasks = [];
    tasks.push(function(next) {
      fsUtility.writeModel(model, next);
    });
    workspace.execute(tasks, cb);
  }
}

mixin(ModelMethod.prototype, ModelMethodActions.prototype);
