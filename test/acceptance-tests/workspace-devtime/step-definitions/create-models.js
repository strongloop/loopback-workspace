'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const loopback = require('loopback');
const ModelClass = require('../../../../component/datamodel/model');
const path = require('path');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const ModelDefinition = app.models.ModelDefinition;
const ModelProperty = app.models.ModelProperty;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that I have loaded the workspace$/, function(next) {
    //TODO(DEEPAK) - modify here to load a particular workspace dir
    next();
  });

  this.When(/^I create model '(.+)'$/, function(modelName, next) {
    testsuite.modelId = 'common.' + modelName;
    const model = {
      'id': testsuite.modelId,
      'name': modelName,
      'readonly': true,
      'plural': 'customers',
      'strict': true,
      'public': true,
      'idInjection': true,
    };
    testsuite.modelName = modelName;
    ModelDefinition.create(model, {}, function(err, data) {
      if (err) return next(err);
      testsuite.expectedModel = model;
      next();
    });
  });

  this.Then(/^the model definition is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const storedModel = workspace.getModel(testsuite.modelId);
    expect(testsuite.expectedModel).to.eql(storedModel._content);
    next();
  });

  this.Given(/^the model '(.+)' exists$/, function(modelName, next) {
    testsuite.modelId = 'common.' + modelName;
    const workspace = workspaceManager.getWorkspace();
    const storedModel = workspace.getModel(testsuite.modelId);
    expect(storedModel).to.not.to.be.undefined();
    expect(storedModel).to.be.an.instanceOf(ModelClass);
    next();
  });

  this.When(/^I add property '(.+)' of type '(.+)'$/,
    function(propertyName, type, next) {
      testsuite.propertyId = testsuite.modelId + '.' + propertyName;
      const propertyDef = {
        'id': testsuite.propertyId,
        'name': propertyName,
        'type': type,
      };
      ModelProperty.create(propertyDef, {}, function(err, data) {
        if (err) return next(err);
        testsuite.expectedProperty = propertyDef;
        next();
      });
    });

  this.Then(/^the model property is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const property = workspace.getModelProperty(testsuite.propertyId);
    expect(testsuite.expectedProperty).to.eql(property._content);
    next();
  });
};
