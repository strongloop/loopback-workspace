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

  this.When(/^I add property '(.+)' of type '(.+)'$/,
    function(propertyName, type, next) {
      testsuite.propertyId = propertyName;
      const propertyDef = {
        modelId: testsuite.modelId,
        name: propertyName,
        type: type,
      };
      const options = {workspaceId: testsuite.workspaceId};
      ModelProperty.create(propertyDef, options, function(err, data) {
        if (err) return next(err);
        testsuite.expectedProperty = propertyDef;
        next();
      });
    });

  this.Then(/^the model property is created$/, function(next) {
    const model = testsuite.workspace.getModel(testsuite.modelId);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const property = data &&
        data.properties &&
        data.properties[testsuite.expectedProperty.name];
      expect(property).to.not.to.be.undefined();
      expect(testsuite.expectedProperty).to.eql(property);
      next();
    });
  });
};
