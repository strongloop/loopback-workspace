'use strict';

const Model = require('../datamodel/model');
const ModelConfig = require('../datamodel/model-config');
const ModelProperty = require('../datamodel/model-property');
const ModelMethod = require('../datamodel/model-method');
const mixin = require('../util/mixin');
const fsUtility = require('../util/file-utility');

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
