/* eslint-disable no-undef */
// Copyright IBM Corp. 2013,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const expect = require('chai').expect;
const workspace = require('../server/server');
const models = workspace.models;
const ConfigFile = models.ConfigFile;
const debug = require('debug')('workspace:test:support');

global.Promise = require('bluebird');

const fileExistsSync = function(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

const expectFileExists = function(file) {
  assert(fileExistsSync(file), file + ' does not exist');
};

const expectFileNotExists = function(file) {
  assert(!fileExistsSync(file), file + ' does exist');
};

const getPath = function(relativePath) {
  return ConfigFile.toAbsolutePath(relativePath);
};

const expectValueInJSONFile = function(file, propertyPath, val) {
  const contents = fs.readFileSync(file, 'utf8');
  const obj = JSON.parse(contents);
  expect(obj).to.have.deep.property(propertyPath, val);
};

const FIXTURES = path.resolve(__dirname, 'fixtures/');
const SANDBOX = path.resolve(__dirname, 'sandbox/');

// tell the workspace to load files from the sandbox
process.env.WORKSPACE_DIR = SANDBOX;

const createSandboxDir = function(dirName, cb) {
  fs.mkdir(dirName, cb);
};

const givenEmptySandbox = function(cb) {
  fs.remove(SANDBOX, function(err) {
    if (err) return cb(err);
    createSandboxDir(SANDBOX, cb);
  });

  // Remove any cached modules from SANDBOX
  for (const key in require.cache) {
    if (key.slice(0, SANDBOX.length) == SANDBOX)
      delete require.cache[key];
  }
};

const resetWorkspace = function(cb) {
  async.each(workspace.models(), function(model, cb) {
    if (model.destroyAll) {
      model.destroyAll(cb);
    } else {
      cb();
    }
  }, cb);
};

const givenFile = function(name, pathToFile) {
  return function(done) {
    const configFile = this[name] = new ConfigFile({
      path: pathToFile,
    });
    configFile.load(done);
  };
};

const givenEmptyWorkspace = function(cb) {
  const test = this;
  test.serverFacet = 'server';
  resetWorkspace(function(err) {
    if (err) return cb(err);
    givenEmptySandbox(function(err) {
      if (err) return cb(err);
      models.Facet.create({
        name: test.serverFacet,
      }, cb);
    });
  });
};

const givenBasicWorkspace = function(cb) {
  resetWorkspace(function(err) {
    if (err) return cb(err);
    givenWorkspaceFromTemplate('api-server', cb);
  });
};

const givenWorkspaceFromTemplate = function(template, options, cb) {
  if (cb === undefined && typeof options === 'function') {
    cb = options;
    options = undefined;
  }

  givenEmptySandbox(function(err) {
    if (err) return cb(err);
    workspace.set('workspace dir', SANDBOX);
    models.Workspace.createFromTemplate(template, 'sandbox', options,
      function(err) {
        if (err) return cb(err);
        debug('Created %j in %s', template, SANDBOX);
        cb();
      });
  });
};

const givenLB3Workspace = function(cb) {
  resetWorkspace(function(err) {
    if (err) return cb(err);
    const options = {loopbackVersion: '3.x'};
    givenWorkspaceFromTemplate('empty-server', options, cb);
  });
};

const setWorkspaceToSandboxDir = function() {
  // tell the workspace to load files from the sandbox
  process.env.WORKSPACE_DIR = SANDBOX;
};

function findOfType(name, type) {
  assert(name);
  assert(type);
  return function(query, cb) {
    const test = this;
    if (typeof query === 'function') {
      cb = query;
      query = {};
    }
    type.find(function(err, entities) {
      if (err) return cb(err);
      type.find(function() {
        debug('found %s => %j', name, entities);
        test[name] = entities;
        cb();
      });
    });
  };
}

const findFacets = findOfType('facets', models.Facet);
const findFacetSettings = findOfType('facetSettings', models.FacetSetting);
const findDataSourceDefinitions = findOfType('dataSources', models.DataSourceDefinition);
const findMiddlewares = findOfType('middlewares', models.Middleware);
const findComponentConfigs = findOfType('componentConfigs', models.ComponentConfig);
const findModelConfigs = findOfType('modelConfigs', models.ModelConfig);
const findModelDefinitions = findOfType('models', models.ModelDefinition);
const findViewDefinitions = findOfType('views', models.ViewDefinition);
const findModelProperties = findOfType('properties', models.ModelProperty);
const findModelMethods = findOfType('methods', models.ModelMethod);
const findModelRelations = findOfType('relations', models.ModelRelation);
const findModelAccessControls = findOfType('accessControls', models.ModelAccessControl);
const findPropertyValidations = findOfType('validations', models.PropertyValidation);
const findDatabaseColumns = findOfType('columns', models.DatabaseColumn);

const findAllEntities = function(cb) {
  const test = this;
  let steps = [
    findFacets,
    findDataSourceDefinitions,
    findModelDefinitions,
    findModelConfigs,
    findViewDefinitions,
    findModelProperties,
    findModelMethods,
    findModelRelations,
    findModelAccessControls,
    findPropertyValidations,
    findDatabaseColumns,
  ];

  steps = steps.map(function(fn) {
    return fn.bind(test);
  });

  async.parallel(steps, cb);
};

const toNames = function(arr) {
  return arr.map(function(entity) {
    return entity.name;
  });
};

module.exports = exports = {
  fileExistsSync,
  findAllEntities,
  setWorkspaceToSandboxDir,
  expectFileExists,
  expectFileNotExists,
  givenEmptyWorkspace,
  givenBasicWorkspace,
  givenWorkspaceFromTemplate,
  givenLB3Workspace,
  givenEmptySandbox,
  createSandboxDir,
  SANDBOX,
  FIXTURES,
  givenFile,
  toNames,
  resetWorkspace,
  findComponentConfigs,
  findDataSourceDefinitions,
  getPath,
  findMiddlewares,
};

// Let express know that we are runing from unit-tests
// This way the default error handler does not log
// errors to STDOUT
process.env.NODE_ENV = 'test';
