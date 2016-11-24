'use strict';
var app = require('../../../../../');
var async = require('async');
var expect = require('chai').expect;
var loopback = require('loopback');
var path = require('path');
var util = require('util');

module.exports = function() {
  var ModelProperty = app.models.ModelProperty;
  var exampleWorkspace = path.resolve(__dirname, '../../../../../example/common/models');
  var testsuite = this;
  this.Given(/^The model '(.+)' has a property '(.+)'$/, function(modelName, propertyName, next) {
    testsuite.modelName = modelName;
    testsuite.propertyName = propertyName;
    next();
  });

  this.When(/^I query for the model property$/, function(next) {
    var propertyId = 'common.' + testsuite.modelName + '.' + testsuite.propertyName;
    ModelProperty.find(exampleWorkspace, propertyId, function(err, data) {
      if (err) return next(err);
      testsuite.propertyDef = data;
      next();
    });
  });

  this.Then(/^The model property config is returned$/, function(next) {
    expect(Object.keys(testsuite.propertyDef)).to.eql([
      'type',
      'id',
      'required',
      'length',
      'precision',
      'scale',
    ]);
    next();
  });
};
