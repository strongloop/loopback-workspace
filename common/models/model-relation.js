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
      const fromModelName = relationDef.modelId;
      const toModelName = relationDef.model;
      const facet = relationDef.facetName;
      const modelId = facet + '.' + fromModelName;
      const toModelId = facet + '.' + toModelName;
      delete relationDef.modelId;
      delete relationDef.facetName;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const relationName = relationDef.id;
      delete relationDef.id;
      RelationsHandler.createRelation(
        workspace, relationName, modelId, toModelId, relationDef, cb);
    };
  });
};

