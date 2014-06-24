var async = require('async');
var app = require('../app');
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var Workspace = app.models.Workspace;
var ConfigFile = app.models.ConfigFile;

describe('Workspace', function() {
  describe('Workspace.getAvailableTemplates(callback)', function() {
    it('Get an array of available template names.', function(done) {
      Workspace.getAvailableTemplates(function(err, templates) {
        expect(templates).to.contain('default');
        expect(templates).to.contain('empty');
        done();
      });
    });
  });

  describe('Workspace.createFromTemplate(templateName, callback)', function() {
    beforeEach(givenEmptyWorkspace);
    beforeEach(findAllEntities);

    it('it should create a set of app definitions', function() {
      var appNames = toNames(this.apps);
      expect(appNames).to.contain('api');
      expect(appNames).to.contain('.');
    });

    it('it should create a set of model definitions', function() {
      var modelNames = toNames(this.models);
      expect(modelNames).to.contain('access-token');
      expect(modelNames).to.contain('user');
    });

    it('it should create a set of data source definitions', function() {
      var dataSourceNames = toNames(this.dataSources);
      expect(dataSourceNames).to.contain('mail');
      expect(dataSourceNames).to.contain('db');
    });
  });

  describe('Workspace.listUseableConnectors(cb)', function () {
    it('should return a list of connectors in package.json');
  });
});
