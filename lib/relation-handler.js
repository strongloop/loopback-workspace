'use strict';
class RelationsHandler {
  static createRelation(
    workspace, relationName, fromModelId, toModelId, data, cb) {
    function create(next) {
      workspace.addModelRelation(relationName, fromModelId, toModelId, data,
      function(err) {
        next(err);
      });
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, data);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }
  static deleteRelation(
    workspace, modelId, relationName, cb) {
    function create(next) {
      workspace.removeModelRelation(modelId, relationName,
      function(err) {
        next(err);
      });
    }
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, relationName);
    }
    const taskList = [create];
    workspace.execute(taskList, callback);
  }
}
module.exports = RelationsHandler;
