// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

/**
  * Represents a method of a LoopBack `Model`.
  *
  * @class ModelMethod
  */
module.exports = function(ModelMethod) {
  ModelMethod.on('dataSourceAttached', function(eventData) {
    ModelMethod.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelMethod.getConnector();
      connector.createModelMethod(
        options.workspaceId,
        data.modelId,
        data.name,
        data,
        cb);
    };
    ModelMethod.find = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const connector = ModelMethod.getConnector();
      connector.findModelMethod(options.workspaceId, id, cb);
    };
  });
};
