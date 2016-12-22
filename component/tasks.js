'use strict';
var Model = require('./datamodel/model');

/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addModel(modelId, modelDef, cb) {
    var workspace = this;
    var model = new Model(workspace, modelId, modelDef);
    cb(null, modelDef);
  }
};

module.exports = Tasks;
