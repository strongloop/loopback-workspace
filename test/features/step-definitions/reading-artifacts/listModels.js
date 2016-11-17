'use strict';
var util = require('util');
var async = require('async');
var app = require('../../../../');
var loopback = require('loopback');
var ModelConfig = app.models.ModelConfig;

module.exports = function() {

  var numberOfExpectedModels = 0;
  var numberOfAvailableModels = 0;
  var testcase = this;

  this.Given(/^I have a workspace containing (\d+) models$/, function(numberOfExpectedModels, next) {
		testcase.numberOfExpectedModels = parseInt(numberOfExpectedModels);
		next();
  });

  this.When(/^I list models for the workspace$/, function (next) {
		ModelConfig.find(function (err, list){
		  testcase.numberOfAvailableModels = list.length;
		  next(); 
		});
  });

  this.Then(/^All the model configs are returned$/, function (next) {
		if (testcase.numberOfExpectedModels !== testcase.numberOfAvailableModels)
			throw(new Error("This test didn't pass, numberOfAvailableModels is " + testcase.numberOfAvailableModels));
		next();
  });

};