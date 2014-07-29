var app = require('../app');

/**
 * Represents a relation between two LoopBack `Model`s.
 *
 * @class ModelRelation
 * @inherits WorkspaceEntity
 */

var ModelRelation = app.models.ModelRelation;

/**
 * - `type` is required and must be a valid type name
 *
 * @header Property Validation
 */

ModelRelation.validatesPresenceOf('type');


/**
 * Get an array of valid types.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {Array} types An array of objects with the following format:
 * ```js
 * {
 *   value: 'the value', // may be string or number
 *   humanized: 'the humanized value'
 * }
 * ```
 */

ModelRelation.getValidTypes = function(cb) {
  cb(null, [
    { name: 'has many', value: 'hasMany' },
    { name: 'belongs to', value: 'belongsTo' },
    { name: 'has and belongs to many', value: 'hasAndBelongsToMany' },
    { name: 'has one', value: 'hasOne' }
  ]);
}
