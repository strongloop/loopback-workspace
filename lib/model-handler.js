'use strict';

const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelProperty = require('./datamodel/model-property');
const ModelMethod = require('./datamodel/model-method');
const mixin = require('./util/mixin');
const fsUtility = require('./util/file-utility');

class ModelActions {
  create(cb) {
    const workspace = this.getWorkspace();
    const self = this;
    fsUtility.writeModel(self, cb);
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    const model = this;
    fsUtility.readModel(
      model.getFacetName(),
      model.getName(),
      workspace,
      function(err, modelDef) {
        if (err) return cb(err);
        model.updateDefinition(modelDef);
        cb();
      });
  }
  update(attrs, cb) {
    const workspace = this.getWorkspace();
    const model = this;
    model.set(attrs);
    fsUtility.writeModel(model, cb);
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

module.exports.findAllModels = function(workspace, cb) {
  workspace.fileList(function(err, files) {
    if (err) return cb(err);
    const modelFilePaths = files.Models || [];
    const taskList = [];
    const erroredFiles = [];
    modelFilePaths.forEach(function(filePath) {
      taskList.push(function(next) {
        workspace.loadModel(filePath,
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
