// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  readModel: readModel,
  readModelConfig: readModelConfig,
  readDataSource: readDataSource,
  writeDataSourceConfig: writeDataSourceConfig,
  writeFacet: writeFacet,
  writeFacetConfig: writeFacetConfig,
  writeModel: writeModel,
  writeMiddleware: writeMiddleware,
  writeModelConfig: writeModelConfig,
  writePackageDefinition: writePackageDefinition,
};

function writeFacet(workspace, facet, cb) {
  const facetFolder = facet.getPath();
  const tasks = [];
  tasks.push(function(next) {
    fs.mkdirp(facetFolder, next);
  });
  tasks.push(function(next) {
    writeFacetConfig(facet, next);
  });
  tasks.push(function(next) {
    writeModelConfig(facet, next);
  });
  async.series(tasks, cb);
}

function writeFacetConfig(facet, cb) {
  const facetConfigFile = facet.getConfigPath();
  const facetConfig = facet.getConfig();
  fs.writeJson(facetConfigFile, facetConfig, cb);
}

function writeModelConfig(facet, cb) {
  const filePath = facet.getModelConfigPath();
  const data = facet.getModelConfig();
  fs.writeJson(filePath, data, cb);
}

function writeModel(model, cb) {
  const filePath = model.getFilePath();
  const data = model.getDefinition();
  fs.writeJson(filePath, data, cb);
}

function writeDataSourceConfig(workspace, cb) {
  const dsList = workspace.getAllDataSources();
  const configData = {};
  Object.keys(dsList).forEach(function(key) {
    const ds = dsList[key];
    configData[key] = ds.getDefinition();
  });
  const filePath = workspace.getDataSourceConfigFilePath();
  fs.mkdirp(path.dirname(filePath), function(err) {
    if (err) return cb(err);
    fs.writeJson(filePath, configData, function(err) {
      if (err) return cb(err);
      cb(null, configData);
    });
  });
}

function writeMiddleware(workspace, cb) {
  const data = workspace.getMiddlewareConfig();
  const file = workspace.getMiddlewareFilePath();
  fs.mkdirp(path.dirname(file), function(err) {
    if (err) return cb(err);
    fs.writeJson(file, data, function(err) {
      if (err) return cb(err);
      cb(null);
    });
  });
}

function writePackageDefinition(packageDef, cb) {
  const filePath = packageDef.getFilePath();
  const data = packageDef.getDefinition();
  fs.writeJson(filePath, data, cb);
}

function readModelConfig(facet, cb) {
  const filePath = facet.getModelConfigPath();
  fs.readJson(filePath, function(err, data) {
    if (err) return err;
    facet.setModelConfig(data);
    cb(null, data);
  });
}

function readModel(facetName, modelName, workspace, cb) {
  const filePath = workspace.getModelDefinitionPath(facetName, modelName);
  fs.readJson(filePath, cb);
}

function readDataSource(workspace, cb) {
  const filePath = workspace.getDataSourceConfigFilePath();
  fs.readJson(filePath, function(err, data) {
    if (err) return err;
    workspace.setDatasources(data);
    cb(null, data);
  });
}
