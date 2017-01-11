// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

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
    ModelProperty.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const connector = ModelProperty.getConnector();
      const id = data.id;
      const tokens = id.split('.');
      if (tokens && tokens.length === 3) {
        const facet = tokens[0];
        const modelName = tokens[1];
        const propertyName = tokens[2];
        const modelId = facet + '.' + modelName;
        connector.createModelProperty(
          options.workpaceId,
          modelId,
          propertyName,
          data,
          cb);
      } else {
        return cb('invalid id field');
      }
    };
  });
};
