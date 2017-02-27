'use strict';
class MiddlewareHandler {
  static addPhase(workspace, name, data, cb) {
    function create(next) {
      workspace.addMiddlewarePhase(name, data, function(err) {
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
  static findPhase(workspace, phaseName, cb) {
    function refresh(next) {
      workspace.refreshMiddleware(next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      const phase = workspace.getMiddlewarePhase(phaseName);
      const middleware = phase.getMiddlewareList();
      if (middleware) return cb(null, middleware);
      cb('middleware not found');
    }
    const taskList = [refresh];
    workspace.execute(taskList, callback);
  }
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
    if (typeof phaseName === 'function') {
      cb = phaseName;
      phaseName = null;
    }
    function refresh(next) {
      workspace.refreshMiddleware(next);
    }
    function callback(err, results) {
      if (err) return cb(err);
      if (phaseName) {
        const phase = workspace.getMiddlewarePhase(phaseName);
        const middleware = phase.getMiddleware(middlewarePath);
        if (middleware) return cb(null, middleware.getConfig());
        return cb(new Error('middleware not found'));
      } else {
        const phases = workspace.getMiddlewareConfig();
        if (!phases) return cb(new Error('invalid configuration'));
        const list = [];
        Object.keys(phases).forEach(function(key) {
          let config = {};
          if (phases[key]) {
            Object.keys(phases[key]).forEach(function(m) {
              let middleware = phases[key][m];
              middleware.phase = key;
              list.push(middleware);
            });
          }
        });
        return cb(null, list);
      }
    }
    const taskList = [refresh];
    workspace.execute(taskList, callback);
  }
}
module.exports = MiddlewareHandler;
