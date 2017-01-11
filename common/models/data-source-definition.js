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
      connector.createDataSource(id, data, cb);
    };
    DataSourceDefinition.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const id = filter.where.id;
      const connector = DataSourceDefinition.getConnector();
      connector.findDataSource(id, cb);
    };
  });
};
