'use strict';

const ModelConfig = require('../datamodel/model-config');
const mixin = require('../util/mixin');
const fsUtility = require('../util/file-utility');

class ModelConfigActions {
  create(facetName, modelId, cb) {
    const workspace = this.getWorkspace();
    const modelConfig = this;
    const facet = workspace.facet(facetName);
    const model = workspace.models(modelId);
    fsUtility.writeModelConfig(facet, modelConfig, function(err) {
      if (err) return cb(err);
      modelConfig.connect(facet, model);
      facet.add(modelConfig);
      cb();
    });
  }
  update(facet, modelId, attrs, cb) {
    const workspace = this.getWorkspace();
    const modelConfig = this;
    modelConfig.set(attrs);
    fsUtility.writeModelConfig(facet, modelConfig, cb);
  }
}

mixin(ModelConfig.prototype, ModelConfigActions.prototype);
