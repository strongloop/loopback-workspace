// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const clone = require('lodash').clone;
const ModelRelation = require('../../lib/datamodel/model-relationship');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Represents a relation between two LoopBack `Model`s.
  *
  * @class ModelRelation
  */
module.exports = function(Model) {
  Model.getValidTypes = function(cb) {
    cb(null, [
      {name: 'has many', value: 'hasMany'},
      {name: 'belongs to', value: 'belongsTo'},
      {name: 'has and belongs to many', value: 'hasAndBelongsToMany'},
      {name: 'has one', value: 'hasOne'},
    ]);
  };

  Model.on('dataSourceAttached', function(eventData) {
    Model.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = data.name;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const relation =
        new ModelRelation(workspace, id, data);
      relation.execute(
      relation.create.bind(relation, data.modelId, data.model), cb);
    };
    Model.removeModel = function(query, options, cb) {
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
      const model = workspace.models(modelId);
      const relation = model.relations(relationName);
      relation.execute(
      relation.delete.bind(relation, modelId, relationName), cb);
    };
  });
};
