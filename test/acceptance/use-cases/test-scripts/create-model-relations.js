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
  this.Given(/^I add relation '(.+)' from '(.+)' to '(.+)'$/,
  function(relationName, fromModelName, toModelName, next) {
    testsuite.fromModelName = fromModelName;
    testsuite.toModelName = toModelName;
    testsuite.relationName = relationName;
    next();
  });

  this.When(/^the relation is of type '(.+)' and foreignKey '(.+)'$/,
    function(relationType, foreignKey, next) {
      const relationDef = {
        id: testsuite.relationName,
        type: relationType,
        foreignKey: foreignKey,
        modelId: testsuite.fromModelName,
        model: testsuite.toModelName,
        facetName: 'common.models',
      };
      const options = {workspaceId: testsuite.workspaceId};
      testsuite.expectedRelation = relationDef;
      ModelRelation.create(relationDef, options, function(err) {
        if (err) return next(err);
        next();
      });
    });

  this.Then(/^the model relation is created$/, function(next) {
    const relationDef = testsuite.expectedRelation;
    const facetName = relationDef.facetName;
    const fromModelName = relationDef.modelId;
    delete relationDef.id;
    delete relationDef.facetName;
    delete relationDef.modelId;
    const model =
      testsuite.workspace.getModel(facetName + '.' + fromModelName);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const relation = data &&
        data.relations &&
        data.relations[testsuite.relationName];
      expect(relation).to.not.to.be.undefined();
      expect(testsuite.expectedRelation).to.eql(relation);
      next();
    });
  });
};
