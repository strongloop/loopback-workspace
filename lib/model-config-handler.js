'use strict';

const workspaceHandler = require('./workspace-handler');
const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelProperty = require('./datamodel/model-property');
const ModelMethod = require('./datamodel/model-method');
const mixin = require('./util/mixin');
const fsUtility = require('./util/file-utility');

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
    fsUtility.writeModelConfig(facet, cb);
  }
}

mixin(ModelConfig.prototype, ModelConfigActions.prototype);
