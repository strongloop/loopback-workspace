'use strict';
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const path = require('path');
const testSupport = require('./test-support');
const workspaceManager = require('../../component/workspace-manager');
const config = require('./config');

module.exports = {
  setup: function(templateName) {
    this.workspaceDir =
      testSupport.givenSandboxDir(templateName);
    this.workspace =
      workspaceManager.getWorkspaceByFolder(this.workspaceDir);
    this.workspaceId = this.workspace.getId();
  },
  saveInputs: function(data) {
    this.data = data;
  },
  createModel: function(model, cb) {
    const testsuite = this;
    testsuite.outputs = {};
    const options = {workspaceId: this.workspaceId};
    model.create(this.data, options, function(err, data) {
      if (err) return cb(err);
      testsuite.outputs = data;
      cb();
    });
  },
  getInputsToCompare: function() {
    const data = this.data;
    const expectedData = Object.assign({}, data);
    delete expectedData.id;
    delete expectedData.facetName;
    return expectedData;
  },
  getDefaultModelsMeta: function() {
    return config.DefaultModelsMeta;
  },
  getSavedInputs: function() {
    return this.data;
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
  checkFacet: function(cb) {
    const dir = this.workspace.getDirectory();
    const serverDir = path.join(dir, 'server');
    fs.readdir(serverDir, function(err, fileList) {
      if (err) return cb(err);
      const expectedList = ['config.json', 'model-config.json'];
      expect(fileList).to.include.members(expectedList);
      cb();
    });
  },
  readModelConfig: function(cb) {
    const facet = this.workspace.getFacet('server');
    const modelConfigPath = facet.getModelConfigPath();
    fs.readJson(modelConfigPath, cb);
  },
  readDataSource: function(cb) {
    const configFile = this.workspace.getDataSourceConfigFilePath();
    fs.readJson(configFile, cb);
  },
};
