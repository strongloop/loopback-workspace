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
}
module.exports = DataSourceHandler;
