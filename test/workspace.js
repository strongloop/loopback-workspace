var async = require('async');
var fs = require('fs-extra');
var app = require('../app');
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var Workspace = app.models.Workspace;
var ConfigFile = app.models.ConfigFile;
var ComponentDefinition = app.models.ComponentDefinition;

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

  describe('Workspace.addComponent(options, cb)', function () {
    beforeEach(givenEmptySandbox);
    beforeEach(function(done) {
      Workspace.addComponent({
        template: 'rest'
      }, done);
    });
    it('should add the static component files', function () {
      expectFileExists(getPath('rest/rest.js'));
      expectFileExists(getPath('rest/boot/authentication.js'));
    });

    it('should provide a hook for custom of `cp -r`', function(done) {
      var calls = [];
      var ncp = Workspace.copyRecursive;
      Workspace.copyRecursive = function(src, dest, cb) {
        calls.push([src, dest]);
        process.nextTick(cb);
      };

      Workspace.addComponent(
        {
          template: 'server'
        },
        function(err) {
          Workspace.copyRecursive = ncp;
          if (err) return done(err);
          expect(calls).to.be.not.empty;
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
      expect(dataSourceNames).to.contain('db');
    });

    it('should set correct name in package.json', function() {
      var pkg = fs.readJsonFileSync(SANDBOX + '/package.json');
      // project name is hard-coded in support.js as 'sandbox'
      expect(pkg.name).to.equal('sandbox');
    });
  });

  describe('Workspace.listUseableConnectors(cb)', function () {
    it('should return a list of connectors in package.json');
  });

  describe('project.listAvailableConnectors(cb)', function() {
    before(function(done) {
      Workspace.listAvailableConnectors(function(err, list) {
        this.connectors = list;
        done(err);
      }.bind(this));
    });

    it('should include Memory connector', function() {
      var names = this.connectors.map(function(it) { return it.name; });
      expect(names).to.contain('memory');
    });
  });

  describe('Workspace.isValidDir(cb)', function() {
    beforeEach(resetWorkspace);
    beforeEach(givenEmptySandbox);

    it('returns no errors for a valid workspace dir', function(done) {
      givenBasicWorkspace(function(err) {
        if (err) return done(err);
        Workspace.isValidDir(function(err) {
          // the test passes when no error is reported
          done(err);
        });
      });
    });

    it('should fail when the directory is empty', function(done) {
      Workspace.isValidDir(function(err) {
        expect(err && err.message)
          .to.match(/Invalid workspace: no components found/);
        done();
      });
    });

    it('should fail when a json file is malformed', function(done) {
      fs.writeFileSync(SANDBOX + '/package.json', '{malformed}', 'utf-8');
      Workspace.isValidDir(function(err) {
        expect(err && err.message)
          .to.match(/Cannot parse package.json/);
        done();
      });
    });
  });
});
