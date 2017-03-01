// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const modelHandler = require('../../lib/model-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Represents a Property of a LoopBack `Model`.
  *
  * @class ModelProperty
  */
module.exports = function(ModelProperty) {
  ModelProperty.validatesFormatOf('name', {with: /^[\-_a-zA-Z0-9]+$/});

  /**
   * List of built-in types that can be used for `ModelProperty.type`.
   * @type {string[]}
   */
  ModelProperty.availableTypes = [
    'string',
    'number',
    'boolean',
    'object',
    'array',
    'date',
    'buffer',
    'geopoint',
    'any',
  ];

  ModelProperty.getAvailableTypes = function(cb) {
    cb(null, ModelProperty.availableTypes);
  };

  ModelProperty.remoteMethod('getAvailableTypes', {
    http: {verb: 'get', path: '/available-types'},
    returns: {type: ['string'], root: true},
  });

  ModelProperty.on('dataSourceAttached', function(eventData) {
    ModelProperty.createModel = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelProperty.getConnector();
      const propertyName = data.name;
      const modelId = data.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      modelHandler.createModelProperty(workspace,
        modelId,
        propertyName,
        data,
        cb);
    };
    ModelProperty.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      modelHandler.findModelProperty(workspace, id, cb);
    };
    ModelProperty.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelProperty.getConnector();
      const id = filter.where.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      modelHandler.allProperties(workspace, id, cb);
    };
  });
};
