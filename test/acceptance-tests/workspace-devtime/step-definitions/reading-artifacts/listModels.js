'use strict';
var app = require('../../../../../');
var async = require('async');
var expect = require('chai').expect;
var loopback = require('loopback');
var path = require('path');
var util = require('util');

module.exports = function() {
  var numberOfExpectedModels = 0;
  var numberOfAvailableModels = 0;
  var ModelConfig = app.models.ModelConfig;
  var exampleWorkspace = path.resolve(__dirname, '../../../../../example');
  var testsuite = this;

  this.Given(/^I have a workspace containing (\d+) model\(s\)$/, function(numberOfExpectedModels, next) {
    testsuite.numberOfExpectedModels = parseInt(numberOfExpectedModels);
    next();
  });

  this.When(/^I list models for the workspace$/, function(next) {
    ModelConfig.find(exampleWorkspace, function(err, list) {
      if (err) return next(err);
      testsuite.numberOfAvailableModels = list.length;
      next();
    });
  });

  this.Then(/^All the model configs are returned$/, function(next) {
    expect(testsuite.numberOfExpectedModels).to.equal(testsuite.numberOfAvailableModels);
    next();
  });
};
