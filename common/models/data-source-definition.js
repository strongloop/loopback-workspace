// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const DataSource = require('../../lib/datamodel/datasource');
const datasourceHandler = require('../../lib/data-source-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

module.exports = function(DataSourceDefinition) {
  /**
   * Creates a data source definition.
   *
   * @class DataSourceDefinition
   */
  DataSourceDefinition.on('dataSourceAttached', function() {
    DataSourceDefinition.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = DataSourceDefinition.getConnector();
      const facetName = data.facetName;
      const id = facetName + '.' + data.name;
      delete data.facetName;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const datasource = new DataSource(workspace, id, data);
      datasource.execute(datasource.create.bind(datasource), cb);
    };
    DataSourceDefinition.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      datasourceHandler.findDataSource(workspace, id, cb);
    };
    DataSourceDefinition.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where && filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      workspace.events.datasource.find(function(err) {
        if (err) return cb(err);
        if (id) {
          const ds = workspace.getDataSource(id);
          return cb(null, ds.getDefinition());
        }
        const dsList = workspace.getAllDataSourceConfig();
        cb(null, dsList);
      });
    };
    DataSourceDefinition.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      datasourceHandler.updateDataSource(workspace, id, data, cb);
    };
  });
};
