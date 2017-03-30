// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const DataSource = require('../../lib/datamodel/datasource');
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
      const id = data.name;
      delete data.facetName;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const datasource = new DataSource(workspace, id, data);
      datasource.execute(datasource.create.bind(datasource, facetName), cb);
    };
    DataSourceDefinition.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const datasource = new DataSource(workspace, id, {});
      datasource.execute(datasource.find.bind(datasource, id), cb);
    };
    DataSourceDefinition.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      let facetName = filter.where && filter.where.facetName;
      let id = filter.where && filter.where.id;
      if (!id) {
        id = 'temp';
      }
      if (!facetName) {
        facetName = 'server';
      }
      const facet = workspace.facets(facetName);
      let datasource = new DataSource(workspace, id, {});
      datasource.execute(
      datasource.refresh.bind(datasource, facetName),
      function(err) {
        if (err) return cb(err);
        if (id && id !== 'temp') {
          let ds = facet.datasources(id);
          if(ds) return cb(null, ds.getContents());
          cb(new Error('datasource is not found'));
        }
        const dsList = facet.datasources().map();
        cb(null, dsList);
      });
    };
    DataSourceDefinition.updateAttributes = function(id, data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const ds = workspace.getDataSource(id);
      ds.execute(
      ds.update.bind(ds, data),
      function callback(err) {
        if (err) return cb(err);
        cb(null, ds.getDefinition());
      });
    };
  });
};
