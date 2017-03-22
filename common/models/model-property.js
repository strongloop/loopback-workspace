// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const Model = require('../../lib/datamodel/model');
const Property = require('../../lib/datamodel/model-property');
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
      const property = new Property(workspace, propertyName, data);
      property.create(
        modelId,
        cb);
    };
    ModelProperty.findById = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const modelId = filter.where.modelId;
      const id = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = new Model(workspace, modelId, {});
      model.refresh(function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getPropertyDefinitions());
      });
    };
    ModelProperty.all = function(filter, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelProperty.getConnector();
      const id = filter.where.modelId;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const model = workspace.getModel(id);
      model.refresh(function(err) {
        if (err) return cb(err);
        const model = workspace.getModel(id);
        cb(null, model.getPropertyDefinitions());
      });
    };
  });
};
