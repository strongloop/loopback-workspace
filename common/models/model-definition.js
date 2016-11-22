// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

var path = require('path');
var fs = require('fs-extra');

module.exports = function(ModelDefinition) {
  /**
   * Defines a model configuration which attaches a model to a facet and a
   * dataSource. It also can extend a model definition with additional configuration.
   *
   * @class ModelDefinition
   * @inherits Definition
   */

  ModelDefinition.find = function(workspaceDir, id, callback) {
    var file = path.resolve(workspaceDir, id + '.json');
    fs.readJson(file, function(err, data) {
      if (err && err.name === 'SyntaxError') {
        err.message = g.f('Cannot parse %s: %s', id, err.message);
      }
      callback(err, err ? undefined : data);
    });
  };
};
