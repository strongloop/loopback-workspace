'use strict';

module.exports = DataSourceHandler;

function DataSourceHandler(workspace) {
  workspace.registerHandler('DataSource', 'create', workspace.addDataSource);
  workspace.registerHandler('DataSource', 'find', workspace.refreshDataSource);
};

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
