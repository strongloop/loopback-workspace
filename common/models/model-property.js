// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(ModelProperty) {
  /**
   * Represents a Property of a LoopBack `Model`.
   *
   * @class ModelProperty
   * @inherits WorkspaceEntity
   */

  ModelProperty.validatesFormatOf('name', { with: /^[\-_a-zA-Z0-9]+$/ });

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
    http: { verb: 'get', path: '/available-types' },
    returns: { type: ['string'], root: true },
  });
};
