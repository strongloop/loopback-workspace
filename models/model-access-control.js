var app = require('../app');
var ACL = require('loopback').ACL;

/**
 * Represents an Access Control configuration.
 *
 * @class ModelAccessControl
 * @inherits WorkspaceEntity
 */

var ModelAccessControl = app.models.ModelAccessControl;

/**
 * Get the available access types.
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

ModelAccessControl.getAccessTypes = function(cb) {
  cb(null, [
    {value: ACL.READ, humanized: 'Read'},
    {value: ACL.WRITE, humanized: 'Write'},
    {value: ACL.EXECUTE, humanized: 'Execute'}
  ]);
}

/**
 * Get the available permission types.
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

ModelAccessControl.getPermissionTypes = function() {
  cb(null, [
    {value: ACL.DEFAULT, humanized: 'Default'},
    {value: ACL.ALLOW, humanized: 'Allow'},
    {value: ACL.ALARM, humanized: 'Alarm'},
    {value: ACL.AUDIT, humanized: 'Audit'},
    {value: ACL.DENY, humanized: 'Deny'}
  ]);
}

/**
 * Get the available principal types.
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

ModelAccessControl.getPrincipalTypes = function() {
  cb(null, [
    {value: ACL.USER, humanized: 'User'},
    {value: ACL.APP, humanized: 'App'},
    {value: ACL.ROLE, humanized: 'Role'},
    {value: ACL.SCOPE, humanized: 'Scope'}
  ]);
}
