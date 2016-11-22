'use strict';
var app = require('../../../../../');
var async = require('async');
var chai = require('chai');
var loopback = require('loopback');
var path = require('path');
var util = require('util');

module.exports = function() {
  var ModelMethod = app.models.ModelMethod;
  var exampleWorkspace = path.resolve(__dirname, '../../../../../example/common/models');
  var testcase = this;
  this.Given(/^The model '(.+)' has a method '(.+)'$/, function(modelName, methodName, next) {
    testcase.modelName = modelName;
    testcase.methodName = methodName;
    next();
  });

  this.When(/^I query for the model method$/, function(next) {
    var methodId = 'common.' + testcase.modelName + '.' + testcase.methodName;
    ModelMethod.find(exampleWorkspace, methodId, function(err, data) {
      if (err) return next(err);
      testcase.methodConfig = data;
      next();
    });
  });

  this.Then(/^The model method config is returned$/, function(next) {
    var expect = chai.expect;
    expect(Object.keys(testcase.methodConfig)).to.eql([
      'isStatic',
      'accepts',
      'returns',
      'http',
    ]);
    next();
  });
};
