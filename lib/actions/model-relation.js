'use strict';

const ModelRelation = require('../datamodel/model-relationship');
const mixin = require('../util/mixin');
const fsUtility = require('../util/file-utility');

class ModelRelationActions {
  create(fromModelId, toModelId, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.model(fromModelId);
    const toModel = workspace.model(toModelId);
    model.add(this);
    this.connect(model, toModel);
    model.write(model, cb);
  }
  delete(modelId, relationName, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.models(modelId);
    model.removeRelation(relationName);
    model.write(model, cb);
  }
}

mixin(ModelRelation.prototype, ModelRelationActions.prototype);
