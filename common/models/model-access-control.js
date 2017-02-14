// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

/**
 * Represents an Access Control configuration.
 *
 * @class ModelAccessControl
 * @inherits WorkspaceEntity
 */
module.exports = function(ModelAccessControl) {
  ModelAccessControl.on('dataSourceAttached', function(eventData) {
    ModelAccessControl.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = data.index;
      const modelId = data.modelId;
      delete data.index;
      delete data.modelId;
      const connector = ModelAccessControl.getConnector();
      // TODO(Deepak) - add response handling later
      connector.createACL(options.workspaceId,
        modelId,
        id,
        data,
        cb);
    };
  });
};
