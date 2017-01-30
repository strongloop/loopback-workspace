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
      const id = data.id;
      const tokens = id.split('.');
      if (tokens && tokens.length === 3) {
        const facet = tokens[0];
        const modelName = tokens[1];
        const methodName = tokens[2];
        const modelId = facet + '.' + modelName;
        connector.createModelMethod(
          options.workspaceId,
          modelId,
          methodName,
          data,
          cb);
      } else {
        return cb(new Error('invalid id field'));
      }
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
