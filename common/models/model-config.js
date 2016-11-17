// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
var path = require('path');
var fs = require('fs');

module.exports = function(ModelConfig) {
  /**
   * Defines a model configuration which attaches a model to a facet and a
   * dataSource. It also can extend a model definition with additional configuration.
   *
   * @class ModelDefinition
   * @inherits Definition
   */

  ModelConfig.find = function(workspaceDir, id, callback) {
    var absolutePath = path.join(workspaceDir, id);
    fs.readJson(absolutePath, function(err, data) {
      if (err && err.name === 'SyntaxError') {
        err.message = g.f('Cannot parse %s: %s', id, err.message);
      }
      cb(err, err ? undefined : data);
    });
  }

};
