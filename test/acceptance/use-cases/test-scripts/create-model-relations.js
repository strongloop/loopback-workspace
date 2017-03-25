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
        name: testsuite.relationName,
        modelId: 'common.models.' + testsuite.fromModelName,
        model: 'common.models.' + testsuite.toModelName,
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
    const fromModel = relationDef.modelId;
    delete relationDef.id;
    delete relationDef.modelId;
    const model = testsuite.workspace.model(fromModel);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const relation = data &&
        data.relations &&
        data.relations[testsuite.relationName];
      testsuite.expectedRelation.model = testsuite.toModelName;
      expect(relation).to.not.to.be.undefined();
      expect(testsuite.expectedRelation).to.eql(relation);
      next();
    });
  });
};
