var app = require('../');
var AclDefinition = app.models.AclDefinition;
var ACL = require('loopback').ACL;

/**
 * Convert an AclDefinition to a JSON-like object to be used in
 * `model.options.acls`.
 * @param {function(Error=,Object=)} cb
 */
AclDefinition.prototype.toConfig = function(cb) {
  var config = this.toObject();
  delete config.id;
  delete config.modelId;
  for (var k in config) {
    if (config[k] === undefined)
      delete config[k];
  }
  process.nextTick(function() { cb(null, config); });
};

/**
 * List of values to offer for `accessType` property.
 * @type {{name: string, value: string}[]}
 */
AclDefinition.accessTypeValues = [
  { name: 'All (match all types)', value: ACL.ALL },
  { name: 'Read', value: ACL.READ },
  { name: 'Write', value: ACL.WRITE },
  { name: 'Execute', value: ACL.EXECUTE },
];

/**
 * List of built-in role principals. To use a role principal,
 * the ACL should be configured with
 *
 * ```
 * acl.principalType = 'ROLE';
 * acl.principalId = {role value}
 * ```
 *
 * @type {{name: string, value: string}[]}
 */
AclDefinition.builtinRoleValues = [
  { name: 'All users', value: '$everyone' },
  { name: 'Any unauthenticated user', value: '$unauthenticated' },
  { name: 'Any authenticated user', value: '$authenticated' },
  { name: 'Any user related to the object', value: '$related' },
  { name: 'The user owning the object', value: '$owner' },
];

/**
 * List of values to offer for `permissions` property.
 * @type {{name: string, value: string}[]}
 */
AclDefinition.permissionValues = [
  { name: 'Explicitly grant access', value: ACL.ALLOW },
  { name: 'Explicitly deny access', value: ACL.DENY },
  { name: 'Generate an alarm of the access', value: ACL.ALARM },
  { name: 'Log the access', value: ACL.AUDIT },
];
