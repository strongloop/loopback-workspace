'use strict';
const app = require('../..');
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const path = require('path');
const testSupport = require('./test-support');
const workspaceManager = require('../../lib/workspace-manager');
const config = require('./config');
const util = require('util');

app.on('booted', function() {
  app.emit('ready');
});

module.exports = {
  cache: {},
  testDataCache: {},
  expect: expect,
  setup: function(templateName) {
    const tmplCache = this.cache[templateName] = {};
    tmplCache.workspaceDir =
      testSupport.givenSandboxDir(templateName);
    tmplCache.workspace =
      workspaceManager.getWorkspaceByFolder(tmplCache.workspaceDir);
    tmplCache.workspaceId = tmplCache.workspace.getId();
  },
  getWorkspace: function(templateName) {
    return this.cache[templateName] && this.cache[templateName].workspace;
  },
  getWorkspaceId: function(templateName) {
    return this.cache[templateName] && this.cache[templateName].workspaceId;
  },
  getWorkspaceDir: function(templateName) {
    return this.cache[templateName] && this.cache[templateName].workspaceDir;
  },
  getContext: function(templateName) {
    return {workspaceId: this.getWorkspaceId(templateName)};
  },
  createModel: function(model, data, templateName, testName, cb) {
    const testsuite = this;
    this.saveInputs(testName, data);
    const options = {workspaceId: this.getWorkspaceId(templateName)};
    model.create(data, options, cb);
  },
  findModel: function(model, filter, templateName, testName, cb) {
    const testsuite = this;
    this.saveInputs(testName, filter);
    const options = {workspaceId: this.getWorkspaceId(templateName)};
    model.find(filter, options, cb);
  },
  findOne: function(model, filter, templateName, testName, cb) {
    const testsuite = this;
    this.saveInputs(testName, filter);
    const options = {workspaceId: this.getWorkspaceId(templateName)};
    model.findOne(filter, options, cb);
  },
  updateAttributes: function(model, modelId, data, templateName, testName, cb) {
    const testsuite = this;
    this.saveInputs(testName, data);
    const options = {workspaceId: this.getWorkspaceId(templateName)};
    model.updateAttributes(modelId, data, options, cb);
  },
  getInputsToCompare: function(testName) {
    const data = this.testDataCache[testName].data;
    const expectedData = Object.assign({}, data);
    delete expectedData.id;
    delete expectedData.facetName;
    return expectedData;
  },
  getDefaultModelsMeta: function() {
    return config.DefaultModelsMeta;
  },
  saveInputs: function(testName, data) {
    this.testDataCache[testName] = {};
    this.testDataCache[testName].data = data;
  },
  getSavedInputs: function(testName) {
    return this.testDataCache[testName] && this.testDataCache[testName].data;
  },
  createWorkspace: function(Workspace, templateName, next) {
    const testsuite = this;
    this.templateName = templateName;
    this.destinationPath =
      testSupport.givenSandboxDir(this.templateName);
    testSupport.givenEmptySandbox(this.destinationPath, function(err) {
      if (err) return next(err);
      const data = {
        templateName: testsuite.templateName,
        destinationPath: testsuite.destinationPath,
      };
      Workspace.create(data, {}, next);
    });
  },
  getApp: function(cb) {
    return app;
  },
  checkFileExists: function(dir, cb) {
    fs.exists(dir, function(isExists) {
      cb(isExists);
    });
  },
  getTemplate: workspaceManager.getTemplate,
  getFacet: function(templateName, cb) {
    const dir = this.getWorkspace(templateName).getDirectory();
    const serverDir = path.join(dir, 'server');
    fs.readdir(serverDir, cb);
  },
  getModelConfig: function(templateName, cb) {
    const facet = this.getWorkspace(templateName).getFacet('server');
    const modelConfigPath = facet.getModelConfigPath();
    fs.readJson(modelConfigPath, cb);
  },
  getDataSourceConfig: function(templateName, cb) {
    const configFile =
      this.getWorkspace(templateName).getDataSourceConfigFilePath();
    fs.readJson(configFile, cb);
  },
  getMiddlewareConfig: function(templateName, cb) {
    const middlewareFile =
      this.getWorkspace(templateName).getMiddlewareFilePath();
    fs.readJson(middlewareFile, cb);
  },
  injectMockDataSource: function(templateName, cb) {
    const dir = this.getWorkspaceDir(templateName);
    const bootDir =
      path.join(dir, 'server', 'boot', 'inject-ds-bootscript.js');
    const source =
      path.join(__dirname, 'mock-scripts', 'inject-ds-bootscript.js');
    fs.copy(source, bootDir, cb);
  },
};
