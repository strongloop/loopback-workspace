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
  static createModelProperty(workspace, modelId, name, propertyDef, cb) {
    function create(next) {
      workspace.addModelProperty(modelId, name, propertyDef, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, propertyDef);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }
  static createModelMethod(workspace, modelId, name, methodDef, cb) {
    function create(next) {
      workspace.addModelMethod(modelId, name, methodDef, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, methodDef);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }
  static createModelConfig(workspace, modelId, facetName, modelConfig, cb) {
    function create(next) {
      workspace.addModelConfig(modelId, facetName, modelConfig, next);
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
      const facet = facets['server'];
      const config = facet.getModelConfig(modelId);
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

  static updateModel(workspace, modelId, modelDef, cb) {
    function refresh(next) {
      workspace.refreshModel(modelId, next);
    }
    function update(next) {
      workspace.updateModel(modelId, modelDef, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      const model = workspace.getModel(modelId);
      cb(null, model.getDefinition());
    }
    const taskList = [refresh, update];
    workspace.execute(taskList, callback);
  }

  static updateModelConfig(workspace, modelId, facetName, modelConfig, cb) {
    function refresh(next) {
      workspace.refreshModelConfig(facetName, next);
    }
    function update(next) {
      workspace.updateModelConfig(facetName, modelId, modelConfig, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      const facet = workspace.getFacet(facetName);
      const config = facet.getModelConfig(modelId);
      cb(null, config);
    }
    const taskList = [refresh, update];
    workspace.execute(taskList, callback);
  }
}
module.exports = ModelHandler;
