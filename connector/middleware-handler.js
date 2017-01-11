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
  static findMiddleware(workspace, phaseName, middlewarePath, cb) {
    function refresh(next) {
      workspace.refreshMiddleware(next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      const phase = workspace.getMiddlewarePhase(phaseName);
      const middleware = phase.getMiddleware(middlewarePath);
      if (middleware) return cb(null, middleware.getConfig());
      cb('middleware not found');
    }
    const taskList = [refresh];
    workspace.execute(taskList, callback);
  }
}
module.exports = MiddlewareHandler;
