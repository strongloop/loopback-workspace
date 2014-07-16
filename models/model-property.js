var app = require('../app');

/**
 * Represents a Property of a LoopBack `Model`.
 *
 * @class ModelProperty
 * @inherits WorkspaceEntity
 */

var ModelProperty = app.models.ModelProperty;

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
  'geopoint'
];
