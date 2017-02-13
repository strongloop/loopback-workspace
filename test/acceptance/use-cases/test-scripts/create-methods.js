'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const ModelClass = require('../../../../component/datamodel/model');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const ModelDefinition = app.models.ModelDefinition;
const ModelMethod = app.models.ModelMethod;
const ModelProperty = app.models.ModelProperty;
const ModelRelation = app.models.ModelRelation;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;

  this.Given(/^I add model method '(.+)' in workspace '(.+)'$/,
  function(methodName, workspaceName, next) {
    testsuite.methodName = methodName;
    testsuite.modelMethod = {accepts: [], returns: []};
    next();
  });

  this.When(/^the method has an argument '(.+)' type '(.+)'$/,
    function(name, type, next) {
      const argument = {arg: name, type: type};
      testsuite.modelMethod.accepts.push(argument);
      next();
    });

  this.When(/^the method has a return parameter '(.+)' type '(.+)'$/,
    function(name, type, next) {
      const param = {arg: name, type: type};
      testsuite.modelMethod.returns.push(param);
      next();
    });

  this.When(/^I call the model method api$/,
    function(next) {
      testsuite.modelMethod.name = testsuite.methodName;
      testsuite.modelMethod.modelId = testsuite.modelId;
      const options = {workspaceId: testsuite.workspaceId};
      ModelMethod.create(testsuite.modelMethod, options, function(err) {
        if (err) return next(err);
        next();
      });
    });

  this.Then(/^the model method is created$/, function(next) {
    const model = testsuite.workspace.getModel(testsuite.modelId);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const method = data &&
        data.methods &&
        data.methods[testsuite.methodName];
      expect(method).to.not.to.be.undefined();
      expect(testsuite.modelMethod).to.eql(method);
      next();
    });
  });
};
