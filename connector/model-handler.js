'use strict';
class ModelHandler {
  static createModel(workspace, modelId, modelData, cb) {
    const create = function(next) {
      workspace.addModel(modelId, modelData, function(err) {
        next(err);
      });
    };
    const callBack = function(err, results) {
      if (err) return cb(err);
      cb(null, modelData);
    };
    const taskList = [create];
    workspace.execute(taskList, callBack);
  }
}
module.exports = ModelHandler;
