// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

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
        options = null;
      }
      const connector = DataSourceDefinition.getConnector();
      const id = data.id;
      // TODO(Deepak) - add response handling later as part of the callback
      connector.createDataSource(data.workpaceId, id, data, cb);
    };
    DataSourceDefinition.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const id = filter.where.id;
      const connector = DataSourceDefinition.getConnector();
      connector.findDataSource(filter.where.workpaceId, id, cb);
    };
    DataSourceDefinition.updateAttributes = function(id, data, options, cb) {
      const connector = DataSourceDefinition.getConnector();
      connector.updateDataSource(data.workpaceId, id, data, cb);
    };
    declareRemoteMethods(DataSourceDefinition);
  });
};

function declareRemoteMethods(Workspace) {
  Workspace.queryDataSource = function(workpaceId, id, cb) {
    const filter = {};
    filter.where = {
      id: id,
      workpaceId: workpaceId,
    };
    this.find(filter, {}, cb);
  };
  Workspace.remoteMethod('queryDataSource', {
    accepts: [{arg: 'id', type: 'string'}, {arg: 'workpaceId', type: 'string'}],
    returns: [{arg: 'response',
      type: Workspace,
      http: {source: 'res'},
      root: true}],
    http: {
      verb: 'GET',
      path: '/:id/workspace/:workpaceId',
    },
  });
}
