// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var async = require('async');
var fs = require('fs-extra');
var app = require('../');
var request = require('supertest');
var TestDataBuilder = require('./helpers/test-data-builder');
var Workspace = app.models.Workspace;
var ConfigFile = app.models.ConfigFile;

describe('Workspace', function() {
  describe('Workspace.availableLBVersions()', function() {
    it('Get an array of supported loopback versions', function(done) {
      request(app).get('/api/workspaces/loopback-versions').expect(200, function(err, res) {
        if (err) return done(err);
        var versions = res.body.versions;
        expect(versions.length).to.eql(2);
        done();
      });
    });
  });

  describe('Workspace.getAvailableTemplates(callback)', function() {
    it('Get an array of available template names.', function(done) {
      Workspace.getAvailableTemplates(function(err, templates) {
        expect(templates).to.have.members([
          'api-server',
          'empty-server',
          'hello-world',
          'notes',
        ]);
        done();
      });
    });
  });

  describe('Workspace.describeAvailableTemplates(cb)', function() {
    it('returns an expected list', function(done) {
      Workspace.describeAvailableTemplates(function(err, templates) {
        if (err) return done(err);
        expect(templates).to.eql([
          {
            name: 'api-server',
            description: 'A LoopBack API server with local User auth',
            supportedLBVersions: ['2.x', '3.x'],
          },
          {
            name: 'empty-server',
            description: 'An empty LoopBack API, without any configured ' +
              'models or datasources',
            supportedLBVersions: ['2.x', '3.x'],
          },
          {
            description: 'A project containing a controller, ' +
              'including a single vanilla Message and a single remote method',
            name: 'hello-world',
            supportedLBVersions: ['2.x', '3.x'],
          },
          {
            description: 'A project containing a basic working example, ' +
              'including a memory database',
            name: 'notes',
            supportedLBVersions: ['2.x', '3.x'],
          },
        ]);
        done();
      });
    });
  });

  describe('Workspace.addComponent(options, cb)', function() {
    beforeEach(resetWorkspace);
    beforeEach(givenEmptySandbox);

    it('should add the static files', function(done) {
      Workspace.addComponent({
        template: 'api-server',
        root: true,
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
          root: true,
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
        if (err) return done(err);
        test.dataSources = defs;
        done();
      });
    });

    it('should create a set of facets', function() {
      var facetNames = toNames(this.facets);
      expect(facetNames).to.have.members([
        'common',
        'server',
      ]);
    });

    it('should not create a set of model definitions', function() {
      expect(this.models).to.be.empty;
    });

    it('should create a set of data source definitions', function() {
      var dataSourceNames = toNames(this.dataSources);
      expect(dataSourceNames).to.contain('db');
    });

    describe('generated package.json', function() {
      var pkg;

      before(function() {
        pkg = fs.readJsonSync(SANDBOX + '/package.json');
      });

      it('should set correct name', function() {
        // project name is hard-coded in support.js as 'sandbox'
        expect(pkg.name).to.equal('sandbox');
      });

      it('should set correct description', function() {
        expect(pkg.description).to.equal('sandbox');
      });

      it('should set dummy repository', function() {
        expect(pkg.repository).to.be.an('object');
      });
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

    it('should have installed flag', function() {
      var installed = connectors.filter(function(it) {
        return it.installed === true;
      }).map(function(it) {
        return it.name;
      });
      var expectedInstalled = ['memory', 'mail'];

      expect(installed).to.contain.members(expectedInstalled);
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

  describe('Workspace.copyGitignore(templatesDir, dest, cb)', function() {
    beforeEach(givenBasicWorkspace);

    it('generates `.gitignore` properly', function(done) {
      fs.exists(SANDBOX + '/.gitignore', function(exists) {
        expect(exists).to.be.ok;
        done();
      });
    });
  });

  describe('Workspace.loadWorkspace(dir, cb)', function() {
    var TEST_PATH = '/some/test/dir';

    it('sets WORKSPACE_DIR env variable', function(done) {
      Workspace.loadWorkspace(TEST_PATH, function() {
        expect(process.env.WORKSPACE_DIR).to.equal(TEST_PATH);
        done();
      });
    });
  });

  describe('Workspace.getWorkspace(cb)', function() {
    it('returns the value of the WORKSPACE_DIR env variable', function(done) {
      Workspace.getWorkspace(function(err, path) {
        expect(path).to.equal(process.env.WORKSPACE_DIR);
        done();
      });
    });
  });

  describe('Multi-project workspace support', function() {
    before(givenEmptySandbox);
    after(setWorkspaceToSandboxDir);

    it('switches workspace while creating two apps in the same dir',
      function(done) {
        async.series([
          function(next) {
            createSandboxDir(SANDBOX + '/noteapp', next);
          },
          function(next) {
            Workspace.loadWorkspace(SANDBOX + '/noteapp', function() {
              expect(process.env.WORKSPACE_DIR).to.equal(SANDBOX + '/noteapp');
              next();
            });
          },
          function(next) {
            app.models.Workspace.createFromTemplate('notes', 'noteapp', {},
              function(err) {
                if (err) return done(err);
                expectFileExists(getPath('server/server.js'));
                expectFileExists(getPath('server/boot/authentication.js'));
                expectFileExists(getPath('common/models/note.js'));
                expectFileExists(getPath('common/models/note.json'));
                next();
              }
            );
          },
          function(next) {
            createSandboxDir(SANDBOX + '/helloworldapp', next);
          },
          function(next) {
            Workspace.loadWorkspace(SANDBOX + '/helloworldapp', function() {
              expect(process.env.WORKSPACE_DIR).to.equal(SANDBOX + '/helloworldapp');
              next();
            });
          },
          function(next) {
            app.models.Workspace.createFromTemplate('hello-world', 'helloworldapp', {},
              function(err) {
                if (err) return done(err);
                expectFileExists(getPath('server/server.js'));
                expectFileExists(getPath('server/boot/authentication.js'));
                expectFileExists(getPath('common/models/message.js'));
                expectFileExists(getPath('common/models/message.json'));
                expectFileNotExists(getPath('common/models/note.js'));
                expectFileNotExists(getPath('common/models/note.json'));
                next();
              }
            );
          },
        ], done);
      });
  });
});
