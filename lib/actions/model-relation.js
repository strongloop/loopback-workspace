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
    fsUtility.writeModel(model, cb);
  }
  delete(modelId, relationName, cb) {
    const workspace = this.getWorkspace();
    const model = workspace.models(modelId);
    model.removeRelation(relationName);
    fsUtility.writeModel(model, cb);
  }
}

mixin(ModelRelation.prototype, ModelRelationActions.prototype);
