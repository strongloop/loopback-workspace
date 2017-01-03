'use strict';
class MiddlewareHandler {
  static createMiddleware(workspace, phase, path, data, cb) {
    function create(next) {
      workspace.addMiddleware(phase, path, data, function(err) {
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
}
module.exports = MiddlewareHandler;
