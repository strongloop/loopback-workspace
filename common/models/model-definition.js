// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

module.exports = function(ModelDefinition) {
  /**
   * Creates a model definition.
   *
   * @class ModelDefinition
   */
  ModelDefinition.on('dataSourceAttached', function(eventData) {
    ModelDefinition.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const id = data.id;
      const connector = ModelDefinition.getConnector();
      // TODO(Deepak) - add response handling later
      connector.createModel(data.workpaceId, id, data, cb);
    };
    ModelDefinition.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const id = filter.where.id;
      const connector = ModelDefinition.getConnector();
      connector.findModel(filter.where.workpaceId, id, cb);
    };
    ModelDefinition.updateAttributes = function(id, data, options, cb) {
      const connector = ModelDefinition.getConnector();
      connector.updateModel(data.workpaceId, id, data, cb);
    };
  });
};
