'use strict';
class DataSourceHandler {
  static createDataSource(workspace, id, data, cb) {
    const create = function(next) {
      workspace.addDataSource(id, data, function(err) {
        next(err);
      });
    };
    const callBack = function(err, results) {
      if (err) return cb(err);
      cb(null, data);
    };
    const taskList = [create];
    workspace.execute(taskList, callBack);
  }
}
module.exports = DataSourceHandler;
