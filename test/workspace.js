var async = require('async');
var fs = require('fs-extra');
var app = require('../app');
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var Workspace = app.models.Workspace;
var ConfigFile = app.models.ConfigFile;

describe('Workspace', function() {
  describe('Workspace.getAvailableTemplates(callback)', function() {
    it('Get an array of available template names.', function(done) {
      Workspace.getAvailableTemplates(function(err, templates) {
        expect(templates).to.have.members([
          'api-server',
        ]);
        done();
      });
    });
  });

  describe('Workspace.addComponent(options, cb)', function () {
    beforeEach(resetWorkspace);
    beforeEach(givenEmptySandbox);

    it('should add the static files', function(done) {
      Workspace.addComponent({
        template: 'api-server',
        root: true
      }, function(err) {
        if (err) return done(err);
        expectFileExists(getPath('server/server.js'));
        expectFileExists(getPath('server/boot/authentication.js'));
        done();
      });
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
          template: 'api-server',
          root: true
        },
        function(err) {
          Workspace.copyRecursive = ncp;
          if (err) return done(err);
          expect(calls).to.be.not.empty;
          done();
        });
    });
  });

  describe('Workspace.addComponent(options, cb) with subclassing', function () {
    beforeEach(resetWorkspace);
    beforeEach(givenEmptySandbox);

    it('should add the static files', function(done) {
      Workspace.addComponent({
        template: 'api-server',
        subclassingBuiltinModels: true,
        root: true
      }, function(err) {
        if (err) return done(err);
        expectFileExists(getPath('common/models/user.json'));
        expectFileExists(getPath('common/models/access-token.json'));
        expectFileExists(getPath('common/models/role.json'));
        expectFileExists(getPath('common/models/acl.json'));
        expectFileExists(getPath('common/models/application.json'));
        expectFileExists(getPath('common/models/role-mapping.json'));
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

    it('should create a set of facets', function() {
      var facetNames = toNames(this.facets);
      expect(facetNames).to.have.members([
        'common',
        'server'
      ]);
    });

    it('should not create a set of model definitions', function() {
      expect(this.models).to.be.empty;
    });

    it('should create a set of data source definitions', function() {
      var dataSourceNames = toNames(this.dataSources);
      expect(dataSourceNames).to.contain('db');
    });

    it('should set correct name in package.json', function() {
      var pkg = fs.readJsonFileSync(SANDBOX + '/package.json');
      // project name is hard-coded in support.js as 'sandbox'
      expect(pkg.name).to.equal('sandbox');
    });
  });

  describe('project.listAvailableConnectors(cb)', function() {
    var connectors;
    before(function(done) {
      Workspace.listAvailableConnectors(function(err, list) {
        connectors = list;
        done(err);
      });
    });

    it('should include Memory connector', function() {
      var names = connectors.map(function(it) { return it.name; });
      expect(names).to.contain('memory');
    });

    it('should include base model in metadata', function() {
      var meta = findByName('memory');
      expect(meta).to.have.property('baseModel', 'PersistedModel');
    });

    function findByName(name) {
      return connectors.filter(function(c) {
        return c.name === name;
      })[0];
    }
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
          .to.match(/Invalid workspace: no facets found/);
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
