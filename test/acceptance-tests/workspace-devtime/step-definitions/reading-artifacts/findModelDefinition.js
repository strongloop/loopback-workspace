'use strict';
var util = require('util');
var async = require('async');
var app = require('../../../../../');
var loopback = require('loopback');
var chai = require('chai');
var path = require('path');

var ModelDefinition = app.models.ModelDefinition;
var exampleWorkspace = path.resolve(__dirname, '../../../../../example/common/models');
module.exports = function() {
  var testcase = this;
  this.Given(/^The model '(.+)' exists$/, function(modelName, next) {
    testcase.modelName = modelName;
    next();
  });

  this.When(/^I query for the model definition of '(.+)'$/, function(modelName, next) {
    ModelDefinition.find(exampleWorkspace, modelName, function(err, data) {
      if (err) return next(err);
      testcase.modelDef = data;
      next();
    });
  });

  this.Then(/^The model definition is returned$/, function(next) {
    var expect = chai.expect;
    expect(Object.keys(testcase.modelDef)).to.eql([
      'name',
      'idInjection',
      'properties',
      'validations',
      'relations',
      'acls',
      'methods',
    ]);
    next();
  });
};
