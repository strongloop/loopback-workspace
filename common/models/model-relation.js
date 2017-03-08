// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const clone = require('lodash').clone;
const RelationsHandler = require('../../lib/relation-handler');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Represents a relation between two LoopBack `Model`s.
  *
  * @class ModelRelation
  */
module.exports = function(ModelRelation) {
  ModelRelation.getValidTypes = function(cb) {
    cb(null, [
      {name: 'has many', value: 'hasMany'},
      {name: 'belongs to', value: 'belongsTo'},
      {name: 'has and belongs to many', value: 'hasAndBelongsToMany'},
      {name: 'has one', value: 'hasOne'},
    ]);
  };

  ModelRelation.on('dataSourceAttached', function(eventData) {
    ModelRelation.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const relationDef = clone(data);
      const modelId = data.modelId;
      const toModelId = data.model;
      const relationName = data.name;
      delete relationDef.modelId;
      delete relationDef.facetName;
      delete relationDef.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      RelationsHandler.createRelation(
        workspace, relationName, modelId, toModelId, relationDef, cb);
    };
    ModelRelation.removeModel = function(query, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      let filter = query;
      if (query.and && query.and.length) {
        filter = {};
        query.and.forEach(function(valueObj) {
          Object.keys(valueObj).forEach(function(key) {
            filter[key] = valueObj[key];
          });
        });
      }
      const modelId = filter.where.modelId;
      const relationName = filter.where.id;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      RelationsHandler.deleteRelation(
        workspace, modelId, relationName, cb);
    };
  });
};
