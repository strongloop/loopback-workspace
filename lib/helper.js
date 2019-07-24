// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const semver = require('semver');
const normalizeGitUrl = require('normalize-git-url');

exports.DEFAULT_LB_VERSION = '3.x';
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
  const validRange = semver.validRange(version);
  if (validRange != null) {
    return version;
  }
  // Parse git url
  const normalized = normalizeGitUrl(version);
  const branch = normalized.branch;
  // If its the master branch, return the master branch version.
  if (branch === 'master') {
    return exports.MASTER_LB_VERSION;
  }
  // If its a valid loopback version branch then return it,
  // otherwise, return default loopback version
  return semver.validRange(branch) == null ? exports.DEFAULT_LB_VERSION : branch;
};
