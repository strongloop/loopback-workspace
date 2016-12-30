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
const ModelProperty = app.models.ModelProperty;
const ModelRelation = app.models.ModelRelation;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that I have loaded the workspace$/, function(next) {
    workspaceManager.createWorkspace(testSupport.givenSandboxDir());
    next();
  });

  this.When(/^I create model '(.+)'$/, function(modelName, next) {
    testsuite.modelId = 'common.' + modelName;
    const model = {
      id: testsuite.modelId,
      facetName: 'common',
      name: modelName,
      readonly: true,
      plural: 'customers',
      strict: true,
      public: true,
      idInjection: true,
    };
    testsuite.modelName = modelName;
    ModelDefinition.create(model, {}, function(err, data) {
      if (err) return next(err);
      testsuite.expectedModel = model;
      testsuite.expectedModel.properties = {};
      testsuite.expectedModel.methods = {};
      testsuite.expectedModel.relations = {};
      next();
    });
  });

  this.Then(/^the model definition is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const storedModel = workspace.getModel(testsuite.modelId);
    const file = storedModel.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      expect(testsuite.expectedModel).to.eql(data);
      next();
    });
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
        facetName: 'common',
      };
      ModelRelation.create(relationDef, {}, function(err) {
        if (err) return next(err);
        testsuite.expectedRelation = relationDef;
        testsuite.relationTest = {};
        testsuite.relationTest.facetName = relationDef.facetName;
        testsuite.relationTest.fromModelName = relationDef.modelId;
        delete relationDef.id;
        delete relationDef.facetName;
        delete relationDef.modelId;
        next();
      });
    });

  this.Then(/^the model relation is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const facetName = testsuite.relationTest.facetName;
    const fromModelName = testsuite.relationTest.fromModelName;
    const model = workspace.getModel(facetName + '.' + fromModelName);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const relations = data.relations;
      expect(relations).to.not.to.be.undefined();
      const relation = relations[testsuite.relationName];
      expect(relation).to.not.to.be.undefined();
      expect(testsuite.expectedRelation).to.eql(relation);
      next();
    });
  });
};
