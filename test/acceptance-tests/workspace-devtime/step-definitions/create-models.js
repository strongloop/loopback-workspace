'use strict';
var app = require('../../../../');
var expect = require('../../../helpers/expect');
var loopback = require('loopback');
var path = require('path');
var util = require('util');
var workspaceManager = require('../../../../component/workspace-manager.js');
var ModelDefinition = app.models.ModelDefinition;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  var testsuite = this;
  this.Given(/^that I have loaded the workspace$/, function(next) {
    //TODO(DEEPAK) - modify here to load a particular workspace dir
    next();
  });

  this.When(/^I create model '(.+)'$/, function(modelName, next) {
    testsuite.modelId = 'common.' + modelName;
    var model = {
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
    var workspace = workspaceManager.getWorkspace();
    var storedModel = workspace.getModel(testsuite.modelId);
    expect(testsuite.expectedModel).to.eql(storedModel);
    next();
  });
};
