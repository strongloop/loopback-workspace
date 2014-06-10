var app = require('../app');
var async = require('async');
var AppDefinition = app.models.AppDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('AppDefinition', function() {
  describe('appDefinition.loadFromRuntime(callback)', function() {
    it('Load objects from the running app', function() {

    });
  });

  describe('appDefinition.loadFromConfig(callback)', function() {
    beforeEach(givenEmptyWorkspace);
    beforeEach(AppDefinition.loadApps);
    beforeEach(findAllEntities);

    it('should load an app definition from configuration files', function() {

    });

    it('should load an app from the workspace dir', function () {

    });

    it('should have app, model, and datasource definitions', function() {

    });

    it('should error if the root is not a valid loopback workspace', function(done) {

    });
  });

  describe('appDefinition.saveToConfig(callback)', function() {
    it('Save the app definition to a set of configuration files', function() {

    });

    it('should ignore cached relations');
    it('supports project name different from the directory name');
    it('returns a list of files that were updated / written');
    it('should remove a config file when the config has been deleted');
  });

  describe('AppDefinition.loadApps(callback)', function() {
    it('Load app definitions into the attached `dataSource`', function() {

    });
  });

  describe('AppDefinition.saveApps(callback)', function() {
    it('Save all app definitions in the attached `dataSource` to config files.', function() {

    });
  });

  describe('AppDefinition.exists(app, callback)', function() {
    it('Does the given `app` exist on disk as a directory?', function() {

    });
  });

  describe('appDefinition.exists(app, callback)', function() {
    it('Does the given `app` exist on disk as a directory?', function() {

    });
  });

  describe('AppDefinition.load(app, callback)', function() {
    it('Alias for `app.loadFromConfig()`.', function() {

    });
  });

  describe('AppDefinition.getAvailableTemplates(callback)', function() {
    it('Get an array of available template names.', function() {

    });
  });

  describe('AppDefinition.createFromTemplate(templateName, callback)', function() {
    it('In the attached `dataSource`, create a set of app definitions', function() {

    });
  });

  describe('AppDefinition.listUseableConnectors(cb)', function () {
    it('should return a list of connectors in package.json');
  });
});
