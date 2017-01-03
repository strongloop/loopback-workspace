// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  writeDataSourceConfig: writeDataSourceConfig,
  writeModel: writeModel,
  writeMiddleware: writeMiddleware,
};

function writeModel(model, cb) {
  const filePath = model.getFilePath();
  const data = model.getDefinition();
  fs.writeJson(filePath, data, function(err) {
    if (err) return cb(err);
    cb(null, data);
  });
}

function writeDataSourceConfig(workspace, cb) {
  const dsList = workspace.getAllDataSources();
  const configData = {};
  Object.keys(dsList).forEach(function(key) {
    const ds = dsList[key];
    configData[key] = ds.getDefinition();
  });
  const filePath = workspace.getDataSourceConfigFilePath();
  fs.writeJson(filePath, configData, function(err) {
    if (err) return cb(err);
    cb(null, configData);
  });
}

function writeMiddleware(workspace, cb) {
  const data = workspace.getMiddlewareConfig();
  const file = workspace.getMiddlewareFilePath();
  fs.writeJson(file, data, function(err) {
    if (err) return cb(err);
    cb(null);
  });
}
