// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const config = require('../config');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

module.exports = {
  getConfigFiles: getConfigFiles,
  readFile: readFile,
  readModel: readModel,
  removeModel: removeModel,
  readModelConfig: readModelConfig,
  readDataSource: readDataSource,
  readMiddleware: readMiddleware,
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
    writeModelConfig(facet, null, next);
  });
  async.series(tasks, cb);
}

function writeFacetConfig(facet, cb) {
  const facetConfigFile = facet.getConfigPath();
  const facetConfig = facet.getConfig();
  fs.writeJson(facetConfigFile, facetConfig, cb);
}

function writeModelConfig(facet, modelConfig, cb) {
  let data = {};
  data._meta = config.modelsMetadata;
  if(modelConfig)
    data[modelConfig._name] = modelConfig.getContents();
  const modelConfigData =
    facet.modelconfig().map({json: true, filter: 'modelId'});
  data = Object.assign({}, data, modelConfigData);
  const filePath = facet.getModelConfigPath();
  fs.writeJson(filePath, data, cb);
}

function writeModel(model, cb) {
  const filePath = model.getFilePath();
  const data = model.getDefinition();
  const dir = path.dirname(filePath);
  fs.mkdirp(dir, function(err) {
    if (err) return cb(err);
    fs.writeJson(filePath, data, cb);
  });
}

function removeModel(model, cb) {
  const filePath = model.getFilePath();
  fs.unlink(filePath, cb);
}

function writeDataSourceConfig(workspace, cb) {
  const dsList = workspace.getAllDataSourceConfig();
  const configData = {};
  dsList.forEach(function(ds) {
    configData[ds.name] = ds;
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

function writeMiddleware(workspace, phaseArr, cb) {
  const data = workspace.getMiddlewareConfig();
  phaseArr.forEach(function(phaseName) {
    data[phaseName] = {};
  });
  const file = workspace.getMiddlewareFilePath();
  fs.mkdirp(path.dirname(file), function(err) {
    if (err) return cb(err);
    fs.writeJson(file, data, function(err) {
      if (err) return cb(err);
      cb();
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
  fs.readJson(filePath, function(err, config) {
    if (err) return err;
    Object.keys(config).forEach(function(key) {
      if (key === '_meta') return;
      let modelConfig = facet.modelconfig(key);
      if (modelConfig) {
        modelConfig._content = config[key];
      } else {
        facet.setModelConfig(key, config[key]);
      }
    });
    cb(null, config);
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

function readMiddleware(workspace, cb) {
  const filePath = workspace.getMiddlewareFilePath();
  fs.readJson(filePath, function(err, data) {
    if (err) return cb(err);
    workspace.setMiddlewareConfig(data);
    cb(null, data);
  });
}

function readFile(filePath, cb) {
  fs.readJson(filePath, cb);
}

function getConfigFiles(workspaceDir, cb) {
  const patterns = {};
  const files = config.files;
  const steps = [];
  const result = {};
  Object.keys(files).forEach(function(key) {
    patterns[key] = [];
    let filePattern = files[key];
    patterns[key] = patterns[key].concat(filePattern);
  });

  Object.keys(patterns).forEach(function(key) {
    patterns[key] = patterns[key].concat(patterns[key].map(function(pattern) {
      return path.join('*', pattern);
    }));
  });

  function find(pattern, cb) {
    glob(pattern, {cwd: workspaceDir}, cb);
  }

  Object.keys(patterns).forEach(function(key) {
    steps.push(function(next) {
      async.map(patterns[key], find, function(err, paths) {
        if (err) return cb(err);
        // flatten paths into single list
        let merged = [];
        merged = merged.concat.apply(merged, paths);
        result[key] = merged;
        next();
      });
    });
  });

  async.parallel(steps, function(err) {
    if (err) return cb(err);
    cb(null, result);
  });
}
