'use strict';
class ModelAccessHandler {
  static createACL(workspace, modelId, index, data, cb) {
    function create(next) {
      const model = workspace.getModel(modelId);
      const acl = model.getAcl();
      acl.addConfig(index, data);
      next();
    }
    function write(next) {
      workspace.writeModel(modelId, next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, data);
    }
    const taskList = [create, write];
    workspace.execute(taskList, callback);
  }
}
module.exports = ModelAccessHandler;
