// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
var semver = require('semver');

module.exports = function(ModelMethod) {
  /**
   * Represents a Method of a LoopBack `Model`.
   *
   * @class ModelMethod
   * @inherits WorkspaceEntity
   */

  ModelMethod._shouldEncodeStaticFlagInName = function() {
    var version = ModelMethod.app.models.Workspace.loopBackVersion;
    return version != null ? !semver.gtr('3.0.0', version) : false;
  };

  ModelMethod.getJsonKey = function(name, data) {
    if (!this._shouldEncodeStaticFlagInName()) {
      return data.name;
    }
    var isStatic = data.isStatic;
    if (isStatic !== undefined) {
      var matchName = name.match(/^prototype\.(.*)$/);
      if (!isStatic && (matchName === null || !matchName)) {
        data.name = 'prototype.' + name;
      }
    }

    return data.name;
  };

  ModelMethod.getConfigFromData = function(data) {
    var config = ModelMethod.base.getConfigFromData.call(this, data);

    if (this._shouldEncodeStaticFlagInName()) {
      delete config.isStatic;
    }
    delete config.name;

    return config;
  };

  ModelMethod.getDataFromConfig = function(config, name) {
    var data = ModelMethod.base.getDataFromConfig.call(this, config);
    data.name = name;

    if (this._shouldEncodeStaticFlagInName()) {
      var m = name.match(/^prototype\.(.*)$/);
      var isStatic = !m;
      data.name = isStatic ? name : m[1];
      data.isStatic = isStatic;
    }

    return data;
  };
};
