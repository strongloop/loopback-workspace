'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const ModelClass = require('../../../../lib/datamodel/model');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../lib/workspace-manager');

const ModelDefinition = app.models.ModelDefinition;
const ModelMethod = app.models.ModelMethod;
const ModelProperty = app.models.ModelProperty;
const ModelRelation = app.models.ModelRelation;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that I have loaded the workspace '(.+)'$/,
  function(templateName, next) {
    testsuite.workspaceDir =
      testSupport.givenSandboxDir(templateName);
    testsuite.workspace =
      workspaceManager.getWorkspaceByFolder(testsuite.workspaceDir);
    testsuite.workspaceId = testsuite.workspace.getId();
    next();
  });

  this.When(/^I create model '(.+)'$/, function(modelName, next) {
    testsuite.modelId = 'common.models.' + modelName;
    const model = {
      id: testsuite.modelId,
      facetName: 'common',
      name: modelName,
      readonly: true,
      strict: true,
      public: true,
      idInjection: true,
    };
    const options = {workspaceId: testsuite.workspaceId};
    testsuite.modelName = modelName;
    ModelDefinition.create(model, options, function(err, data) {
      if (err) return next(err);
      testsuite.expectedModel = model;
      testsuite.expectedModel.properties = {};
      testsuite.expectedModel.methods = {};
      testsuite.expectedModel.relations = {};
      next();
    });
  });

  this.Then(/^the model definition is created$/, function(next) {
    const storedModel = testsuite.workspace.model(testsuite.modelId);
    const file = storedModel.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      expect(testsuite.expectedModel).to.eql(data);
      next();
    });
  });

  this.Given(/^the model '(.+)' exists in workspace '(.+)'$/,
  function(modelName, workspaceName, next) {
    testsuite.modelId = 'common.models.' + modelName;
    const dir = testSupport.givenSandboxDir(workspaceName);
    testsuite.workspace = workspaceManager.getWorkspaceByFolder(dir);
    testsuite.workspaceId = testsuite.workspace.getId();
    const storedModel = testsuite.workspace.model(testsuite.modelId);
    expect(storedModel).to.not.to.be.undefined();
    expect(storedModel).to.be.an.instanceOf(ModelClass);
    next();
  });
};
