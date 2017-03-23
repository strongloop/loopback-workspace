'use strict';

const DataSource = require('./datamodel/datasource');
const fsUtility = require('./util/file-utility');
const mixin = require('./util/mixin');

module.exports = DataSourceHandler;

function DataSourceHandler(workspace) {
  workspace.registerEvent('datasource.find', workspace.refreshDataSource);
};

class DataSourceActions {
  create(cb) {
    const workspace = this.getWorkspace();
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
}

mixin(DataSource.prototype, DataSourceActions.prototype);

DataSourceHandler.updateDataSource = function(workspace, id, config, cb) {
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
};
