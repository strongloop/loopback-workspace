// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
var fs = require('fs-extra');
var path = require('path');

/**
  * Represents a Property of a LoopBack `Model`.
  *
  * @class ModelProperty
  * @inherits WorkspaceEntity
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

  ModelProperty.find = function(workspaceDir, id, cb) {
    var parts = id.split('.');
    var facet = parts[0];
    var modelName = parts[1];
    var propertyName = parts[2];
    var file = path.resolve(workspaceDir, modelName + '.json');
    fs.readJson(file, function(err, data) {
      if (err && err.name === 'SyntaxError') {
        err.message = g.f('Cannot parse %s: %s', id, err.message);
        return cb(err);
      }
      var properties = data.properties;
      var propertyConfig = properties[propertyName];
      cb(null, propertyConfig);
    });
  };
};
