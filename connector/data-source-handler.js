'use strict';
const boot = require('loopback-boot');
const loopback = require('loopback');

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

  static autoMigrate(workspace, dataSourceName, modelName, cb) {
    const app = loopback({ localRegistry: true, loadBuiltinModels: true });
    
    function bootWithOptions(next) {
      const bootOptions = {
        appRootDir: workspace.getDirectory(),
      };
      boot(app, bootOptions, next);
    }

    function migrate(next) {
      ds = app.dataSources[dataSourceName];
      ds.autoMigrate(modelName, next);
    }

    function callback(err, results) {
      if (err) return cb(err);
      cb(null, true);
    };

    const taskList = [bootWithOptions, migrate];
    workspace.execute(taskList, callback);
  }

}
module.exports = DataSourceHandler;
