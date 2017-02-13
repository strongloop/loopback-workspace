'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const clone = require('lodash').clone;
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const ModelConfig = app.models.ModelConfig;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that the model '(.+)' exists in workspace '(.+)'$/,
  function(modelName, workspaceName, next) {
    testsuite.modelName = modelName;
    testsuite.modelId = 'common.models.' + modelName;
    const dir = testSupport.givenSandboxDir(workspaceName);
    testsuite.workspace = workspaceManager.getWorkspaceByFolder(dir);
    const model = testsuite.workspace.getModel(testsuite.modelId);
    expect(model).to.not.to.be.undefined();
    next();
  });

  this.When(/^I create a model config in facet '(.+)'$/,
  function(facetName, next) {
    const config = {
      facetName: facetName,
      id: testsuite.modelId,
      dataSource: 'db',
    };
    testsuite.ModelConfig = clone(config);
    const options = {workspaceId: testsuite.workspace.getId()};
    ModelConfig.create(config, options, function(err, data) {
      if (err) return next(err);
      next();
    });
  });

  this.Then(/^the model configuration is created$/, function(next) {
    const config = testsuite.ModelConfig;
    const facet = testsuite.workspace.getFacet(config.facetName);
    const file = facet.getModelConfigPath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const storedConfig = data[testsuite.modelName];
      expect(storedConfig).to.not.to.be.undefined();
      delete config.id;
      delete config.facetName;
      expect(storedConfig).to.eql(config);
      next();
    });
  });
};
