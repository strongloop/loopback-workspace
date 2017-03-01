'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../lib/workspace-manager');

const ModelDefinition = app.models.ModelDefinition;
const ModelConfig = app.models.ModelConfig;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;

  this.When(/^I change property '(.+)' to '(.+)'$/,
  function(fieldName, value, next) {
    testsuite.modelId = 'common.models.' + testsuite.modelName;
    const model = {};
    model[fieldName] = value;
    testsuite.expectedFields = {};
    const options = {workspaceId: testsuite.workspaceId};
    ModelDefinition.updateAttributes(testsuite.modelId, model, options,
    function(err) {
      if (err) return next(err);
      testsuite.expectedFields[fieldName] = value;
      next();
    });
  });

  this.Then(/^The model definition json is updated$/, function(next) {
    const storedModel = testsuite.workspace.getModel(testsuite.modelId);
    const file = storedModel.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      Object.keys(testsuite.expectedFields).forEach(function(key) {
        expect(data[key]).to.eql(testsuite.expectedFields[key]);
      });
      next();
    });
  });
};
