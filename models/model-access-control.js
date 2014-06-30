var app = require('../app');
var ACL = require('loopback').ACL;
var Role = require('loopback').Role;

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
 *   name: 'a short name'
 * }
 * ```
 */

ModelAccessControl.getAccessTypes = function(cb) {
  cb(null, [
    { name: 'All (match all types)', value: ACL.ALL },
    { name: 'Read', value: ACL.READ },
    { name: 'Write', value: ACL.WRITE },
    { name: 'Execute', value: ACL.EXECUTE },
  ]);
};

/**
 * Get the available permission types.
 * 
 * @callback {Function} callback
 * @param {Error} err
 * @param {Array} types An array of objects with the following format:
 * ```js
 * {
 *   value: 'the value', // may be string or number
 *   name: 'a descriptive name'
 * }
 * ```
 */

ModelAccessControl.getPermissionTypes = function(cb) {
  cb(null, [
    { name: 'Explicitly grant access', value: ACL.ALLOW },
    { name: 'Explicitly deny access', value: ACL.DENY },
    { name: 'Generate an alarm of the access', value: ACL.ALARM },
    { name: 'Log the access', value: ACL.AUDIT },
  ]);
};

/**
 * Get the available principal types.
 * 
 * @callback {Function} callback
 * @param {Error} err
 * @param {Array} types An array of objects with the following format:
 * ```js
 * {
 *   value: 'the value', // may be string or number
 *   name: 'a descriptive name'
 * }
 * ```
 */

ModelAccessControl.getPrincipalTypes = function(cb) {
  cb(null, [
    { name: 'User', value: ACL.USER },
    { name: 'App', value: ACL.APP },
    { name: 'Role', value: ACL.ROLE },
    { name: 'Scope', value: ACL.SCOPE },
  ]);
};

/**
 * Get the available built-in roles.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {Array} types An array of objects with the following format:
 * ```js
 * {
 *   value: 'the value', // may be string or number
 *   name: 'a descriptive name'
 * }
 * ```
 */
ModelAccessControl.getBuiltinRoles = function(cb) {
  cb(null, [
    { name: 'All users', value: Role.EVERYONE },
    { name: 'Any unauthenticated user', value: Role.UNAUTHENTICATED },
    { name: 'Any authenticated user', value: Role.AUTHENTICATED },
    { name: 'Any user related to the object', value: Role.RELATED },
    { name: 'The user owning the object', value: Role.OWNER },
  ]);
};
