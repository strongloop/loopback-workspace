'use strict';
class ModelHandler {
  static createModel(workspace, modelId, modelData, cb) {
    function create(next) {
      workspace.addModel(modelId, modelData, function(err) {
        next(err);
      });
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, modelData);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }

  static createModelConfig(workspace, modelId, modelConfig, cb) {
    function create(next) {
      workspace.addModelConfig(modelId, modelConfig, function(err) {
        next(err);
      });
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, modelConfig);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }

  static findModelConfig(workspace, modelId, cb) {
    const taskList = [];
    const facets = workspace.getFacets();
    Object.keys(facets).forEach(function(key) {
      let facet = facets[key];
      taskList.push(function(next) {
        workspace.refreshModelConfig(facet.getName(), function(err) {
          next(err);
        });
      });
    });
    function callback(err, results) {
      if (err) return cb(err);
      let config = {};
      Object.keys(facets).forEach(function(key) {
        let facet = facets[key];
        config = facet.getModelConfig(modelId);
      });
      cb(null, config);
    }
    workspace.execute(taskList, callback);
  }

  static findModel(workspace, modelId, cb) {
    function refresh(next) {
      workspace.refreshModel(modelId, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      const model = workspace.getModel(modelId);
      cb(null, model.getDefinition());
    }
    const taskList = [refresh];
    workspace.execute(taskList, callback);
  }
}
module.exports = ModelHandler;
