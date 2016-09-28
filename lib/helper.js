var semver = require('semver');
var normalizeGitUrl = require('normalize-git-url');

exports.DEFAULT_LB_VERSION = '2.x';
exports.MASTER_LB_VERSION = '3.x';

/**
 * parse loopback version
 * @param version
 * @returns parse loopback version or default if invalid
 */
exports.parseLoopBackVersion = function(version) {
  // if the version isn't something meaningful to normalize-git-url,
  // break and return the default to avoid a crash
  if (typeof version !== 'string') {
    return exports.DEFAULT_LB_VERSION;
  }
  // If its a valid loopback version, return it
  var validRange = semver.validRange(version);
  if (validRange != null) {
    return version;
  }
  // Parse git url
  var normalized = normalizeGitUrl(version);
  var branch = normalized.branch;
  // If its the master branch, return the master branch version.
  if (branch === 'master') {
    return exports.MASTER_LB_VERSION;
  }
  // If its a valid loopback version branch then return it,
  // otherwise, return default loopback version
  return semver.validRange(branch) == null ? exports.DEFAULT_LB_VERSION : branch;
};
