'use strict';
class DataSourceHandler {
  static createDataSource(workspace, id, data, cb) {
    function create(next) {
      workspace.addDataSource(id, data, function(err) {
        next(err);
      });
    };
    function callBack(err, results) {
      if (err) return cb(err);
      cb(null, data);
    };
    const taskList = [create];
    workspace.execute(taskList, callBack);
  }

  static findDataSource(workspace, id, cb) {
    function refresh(next) {
      workspace.refreshDataSource(function(err) {
        next(err);
      });
    };
    function callBack(err, results) {
      if (err) return cb(err);
      const ds = workspace.getDataSource(id);
      cb(null, ds.getDefinition());
    };
    const taskList = [refresh];
    workspace.execute(taskList, callBack);
  }

  static updateDataSource(workspace, id, config, cb) {
    function refresh(next) {
      workspace.refreshDataSource(next);
    };
    function update(next) {
      workspace.updateDataSource(id, config, next);
    };
    function callback(err, results) {
      if (err) return cb(err);
      const ds = workspace.getDataSource(id);
      cb(null, ds.getDefinition());
    };
    const taskList = [refresh, update];
    workspace.execute(taskList, callback);
  }
}
module.exports = DataSourceHandler;
