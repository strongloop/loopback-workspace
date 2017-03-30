'use strict';

const ModelProperty = require('../datamodel/model-property');
const ModelMethod = require('../datamodel/model-method');
const mixin = require('../util/mixin');
const fsUtility = require('../util/file-utility');

class ModelPropertyActions {
  create(modelId, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.model(modelId);
    model.add(this);
    model.write(model, cb);
  }
}

mixin(ModelProperty.prototype, ModelPropertyActions.prototype);

class ModelMethodActions {
  create(modelId, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.model(modelId);
    model.add(this);
    model.write(model, cb);
  }
}

mixin(ModelMethod.prototype, ModelMethodActions.prototype);
