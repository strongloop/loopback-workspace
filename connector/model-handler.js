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
}
module.exports = ModelHandler;
