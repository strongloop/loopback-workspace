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
const ModelConfig = app.models.ModelConfig;

module.exports = function() {
  var testsuite = this;

  this.When(/^I query for the model '(.+)'$/, function(modelName, next) {
    testsuite.modelName = modelName;
    const modelId = 'common.' + testsuite.modelName;
    const filter = {
      where: {id: modelId},
    };
    ModelDefinition.find(filter, function(err, data) {
      if (err) return next(err);
      testsuite.modelDef = data;
      next();
    });
  });

  this.Then(/^the model definition is returned$/, function(next) {
    expect(Object.keys(testsuite.modelDef)).to.include.members([
      'name',
      'idInjection',
      'public',
    ]);
    next();
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
