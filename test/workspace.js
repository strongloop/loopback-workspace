var async = require('async');
var app = require('../app');
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var Workspace = app.models.Workspace;
var ConfigFile = app.models.ConfigFile;

describe('Workspace', function() {
  describe('Workspace.getAvailableTemplates(callback)', function() {
    it('Get an array of available template names.', function(done) {
      Workspace.getAvailableTemplates(function(err, templates) {
        expect(templates).to.contain('api-server');
        expect(templates).to.contain('rest');
        expect(templates).to.contain('server');
        done();
      });
    });
  });

  describe('Workspace.createFromTemplate(templateName, callback)', function() {
    beforeEach(givenBasicWorkspace);
    beforeEach(findAllEntities);
    beforeEach(function(done) {
      // TODO(ritch) this should not be required...
      // there is most likely an issue with loading into cache in parallel
      var test = this;
      app.models.DataSourceDefinition.find(function(err, defs) {
        if(err) return done(err);
        test.dataSources = defs;
        done();
      });
    });

    it('it should create a set of component definitions', function() {
      var componentNames = toNames(this.components);
      expect(componentNames).to.contain('rest');
      expect(componentNames).to.contain('.');
      expect(componentNames).to.contain('server');
    });

    it('it should not create a set of model definitions', function() {
      expect(this.models).to.be.empty;
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
