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
    var connector = ModelDefinition.getConnector();
    ModelDefinition.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      var id = data.id;
      //TODO(Deepak) - add response handling later
      connector.createModel(id, data, cb);
    };
  });
};
