'use strict';
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

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
      if (id) {
        const ds = workspace.getDataSource(id);
        return cb(null, ds.getDefinition());
      }
      const dsList = workspace.getAllDataSourceConfig();
      cb(null, dsList);
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
    let app, ds, result;

    function bootApp(next) {
      app = loopback();
      const dir = path.join(workspace.getDirectory(), 'server');
      boot(app, dir, next);
    }

    function migrate(next) {
      ds = app.dataSources[dataSourceName];
      ds.automigrate(modelName, next);
    }

    function find(next) {
      ds.discoverSchemas(modelName, {}, function(err, list) {
        if (err) return next(err);
        result = list;
        next();
      });
    }

    function callback(err) {
      if (err) return cb(err);
      cb(null, result);
    };

    const taskList = [bootApp, migrate, find];
    workspace.execute(taskList, callback);
  }

}
module.exports = DataSourceHandler;
