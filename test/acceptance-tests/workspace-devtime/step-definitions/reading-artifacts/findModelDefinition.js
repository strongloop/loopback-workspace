'use strict';
var util = require('util');
var async = require('async');
var app = require('../../../../');
var loopback = require('loopback');
var ModelDefinition = app.models.ModelDefinition;

module.exports = function() {

  var testcase = this;

  this.Given(/^The model '(.+)' exists$/, function(modelName, next) {
		
		next();
  });

  this.When(/^I query for the model definition of '(.+)'$/, function (modelName, next) {

		next(); 
  });

  this.Then(/^The model definition of '(.+)' is returned$/, function (modelName, next) {
      given.loopBackInSandboxModules();
      ModelDefinition.find(function(err, list) {
        if (err) return next(err);
        var entries = list.map(function(modelDef) {
          return modelDef.name + (modelDef.readonly ? ' (RO)' : '');
        });

        expect(entries).to.include.members([
          'Application (RO)',
          'Email (RO)',
          'User (RO)',
        ]);
        expect(Object.keys(this.data)).to.eql([
          'name',
          'description',
          'plural',
          'base',
          'strict',
          'public',
          'idInjection',
          'scopes',
          'indexes',
          'options',
          'custom',
          'properties',
          'validations',
          'relations',
          'acls',
          'methods',
        ]);
        expect(Object.keys(this.data.properties.id)).to.eql([
          'type',
          'id',
          'generated',
          'required',
          'index',
          'description',
          'custom',
        ]);
        expect(Object.keys(this.data.relations.self)).to.eql([
          'type',
          'model',
          'as',
          'foreignKey',
          'custom',
        ]);
        expect(Object.keys(this.data.acls[0])).to.eql([
          'accessType',
          'principalType',
          'principalId',
          'permission',
          'property',
          'custom',
        ]);

		    next();
      });
  });

};