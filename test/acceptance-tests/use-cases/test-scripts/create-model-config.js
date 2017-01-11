'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
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
  this.Given(/^that the model '(.+)' exists$/,
  function(modelName, next) {
    testsuite.modelName = modelName;
    testsuite.modelId = 'common.' + modelName;
    const workspace = workspaceManager.getWorkspace();
    const model = workspace.getModel(testsuite.modelId);
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
    ModelConfig.create(config, {}, function(err, data) {
      if (err) return next(err);
      delete config.id;
      testsuite.ModelConfig = config;
      next();
    });
  });

  this.Then(/^the model configuration is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const facet = workspace.getFacet(testsuite.ModelConfig.facetName);
    const file = facet.getModelConfigPath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const config = data[testsuite.modelId];
      expect(config).to.not.to.be.undefined();
      expect(testsuite.ModelConfig).to.eql(config);
      next();
    });
  });

  this.When(/^I query for the model config '(.+)'$/, function(modelName, next) {
    testsuite.modelName = modelName;
    const modelId = 'common.' + testsuite.modelName;
    const filter = {
      where: {id: modelId},
    };
    ModelConfig.find(filter, function(err, data) {
      if (err) return next(err);
      testsuite.modelConfig = data;
      next();
    });
  });

  this.Then(/^the model config is returned$/, function(next) {
    expect(Object.keys(testsuite.modelConfig)).to.include.members([
      'dataSource',
      'facetName',
    ]);
    next();
  });
};
