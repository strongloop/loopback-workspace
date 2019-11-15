// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const async = require('async');
const exec = require('child_process').exec;
const expect = require('chai').expect;
const extend = require('util')._extend;
const fs = require('fs-extra');
const mysql = require('mysql');
const path = require('path');
const request = require('supertest');
const semver = require('semver');
const debug = require('debug')('test:end-to-end');
const workspace = require('../');
const models = workspace.models;
const TestDataBuilder = require('./helpers/test-data-builder');
const ref = TestDataBuilder.ref;
const given = require('./helpers/given');
const platform = require('./helpers/platform');
const should = require('chai').should();
const support = require('./support');
const givenBasicWorkspace = support.givenBasicWorkspace;
const givenEmptySandbox = support.givenEmptySandbox;
const resetWorkspace = support.resetWorkspace;
const givenWorkspaceFromTemplate = support.givenWorkspaceFromTemplate;
const SANDBOX = support.SANDBOX;
const FIXTURES = support.FIXTURES;

const Workspace = workspace.models.Workspace;

const PKG_CACHE = path.resolve(__dirname, '.pkgcache');

// settings from test/helpers/setup-mysql.js
const MYSQL_DATABASE = 'loopback_workspace_test';
const MYSQL_USER = 'lbws';
const MYSQL_PASSWORD = 'hbx42rec';

const IS_LEGACY_NODE = /^v0\./.test(process.version);

it.skipIf = function(condition, desc, fn) {
  if (condition) {
    it.skip(desc, fn);
  } else {
    it(desc, fn);
  }
};

describe('end-to-end', function() {
  this.timeout(15000);

  describe('can pass LoopBack version to createFromTemplate()', function() {
    before(resetWorkspace);
    before(givenEmptySandbox);
    it('create template 3.x', function(done) {
      givenWorkspaceFromTemplate('hello-world', {loopbackVersion: '3.x'},
        function(err) {
          if (err) return done(err);
          const dependencies = readPackageJsonSync().dependencies;
          let lbVersion = dependencies.loopback;
          if (lbVersion.charAt(0) === '^') lbVersion = lbVersion.substring(1);
          // eslint-disable-next-line no-unused-expressions
          expect(semver.satisfies(lbVersion, '>=3.0.0')).to.be.true;
          done();
        });
    });
  });

  describe('empty-server template', function() {
    let app;

    before(resetWorkspace);
    before(givenEmptySandbox);

    before(function createWorkspace(done) {
      givenWorkspaceFromTemplate('empty-server', function(err) {
        debug('Created "empty-server" in %s', SANDBOX);
        done(err);
      });
    });

    before(installSandboxPackages);

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('provides status on the root url', function(done) {
      request(app)
        .get('/')
        .expect(200, function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('uptime');
          done();
        });
    });

    it('provides status on the root url only', function(done) {
      // See https://github.com/strongloop/generator-loopback/issues/80
      request(app)
        .get('/does-not-exist')
        .expect(404, done);
    });

    it('has favicon enabled', function(done) {
      request(app)
        .get('/favicon.ico')
        .expect(200, done);
    });

    it('provides CORS headers for all URLs', function(done) {
      request(app).get('/')
        .set('X-Requested-By', 'XMLHttpRequest')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect(200, done);
    });

    it('provides security headers for all URLs ', function(done) {
      request(app).get('/')
        .expect('X-frame-options', 'DENY')
        .expect('x-xss-protection', '1; mode=block')
        .expect('x-content-type-options', 'nosniff')
        .expect('x-download-options', 'noopen')
        .expect(function(res) {
          const headers = res.headers;
          headers.should.not.have.property('x-powered-by');
        })
        .expect(200, done);
    });

    it('includes all built-in phases in `middleware.json`', function(done) {
      const builtinPhases = readBuiltinPhasesFromSanbox();

      const middleware = fs.readJsonSync(
        path.resolve(SANDBOX, 'server/middleware.json'),
      );
      const phaseNames = Object.keys(middleware).filter(isNameOfMainPhase);

      expect(phaseNames).to.eql(builtinPhases);
      done();

      function isNameOfMainPhase(name) {
        return !/:(before|after)$/.test(name);
      }
    });

    it.skipIf(IS_LEGACY_NODE, 'passes scaffolded tests', function(done) {
      execNpm(['test'], {cwd: SANDBOX}, function(err, stdout, stderr) {
        done(err);
      });
    });

    it('emits the `booted` event when booting is complete', function(done) {
      const src = FIXTURES + '/async.js';
      const dest = SANDBOX + '/server/boot/async.js';
      fs.copySync(src, dest);
      delete require.cache[require.resolve(SANDBOX)];
      const app = require(SANDBOX);
      app.on('booted', function() {
        expect(app.asyncBoot, 'app.asyncBoot').to.be.true();
        done();
      });
      // the test will time out if `booted` is not emitted
    });

    it('has legacy explorer route /models disabled', function(done) {
      request(app)
        .get('/api/models')
        .expect(404, done);
    });

    it('has legacy explorer route /routes disabled', function(done) {
      request(app)
        .get('/api/routes')
        .expect(404, done);
    });

    it('comes with loopback-component-explorer', function(done) {
      request(app).get('/explorer/swagger.json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('includes sensitive error details in development mode', function(done) {
      const bootOptions = {
        env: 'development',
      };
      bootSandboxWithOptions(bootOptions, function(err, app) {
        if (err) return done(err);
        request(app)
          .get('/url-does-not-exist')
          .expect(404)
          .end(function(err, res) {
            if (err) return done(err);
            const responseBody = JSON.stringify(res.body);
            expect(responseBody).to.include('stack');
            done();
          });
      });
    });

    it('omits sensitive error details in production mode', function(done) {
      const bootOptions = {
        env: 'production',
      };
      bootSandboxWithOptions(bootOptions, function(err, app) {
        if (err) return done(err);
        request(app)
          .get('/url-does-not-exist')
          .expect(404)
          .end(function(err, res) {
            // Assert that the response body does not contain stack trace.
            // We want the assertion to be robust and keep working even
            // if the property name storing stack trace changes in the future,
            // therefore we test full response body.
            if (err) return done(err);
            const responseBody = JSON.stringify(res.body);
            expect(responseBody).to.not.include('stack');

            done();
          });
      });
    });

    it('disables built-in REST error handler', function(done) {
      const bootOptions = {
        // In "production", strong-error-handler hides error messages too,
        // while the built-in REST error handler does not
        env: 'production',
      };
      bootSandboxWithOptions(bootOptions, function(err, app) {
        if (err) return done(err);

        // create a model with a custom remote method returning a 500 error
        const TestModel = app.registry.createModel('TestModel');
        app.model(TestModel, {dataSource: null});
        TestModel.fail = function(cb) { cb(new Error('sensitive message')); };
        TestModel.remoteMethod('fail', {
          http: {verb: 'get', path: '/fail'},
        });

        request(app)
          .get('/api/TestModels/fail')
          .expect(500)
          .end(function(err, res) {
            if (err) return done(err);
            // Assert that the response body contains a generic message only
            // (produced by strong-error-handler).
            expect(res.body.error.message).to.equal('Internal Server Error');
            done();
          });
      });
    });
  });

  describe('empty-server template without explorer', function() {
    before(resetWorkspace);
    before(function createWorkspace(done) {
      const options = {
        'loopback-component-explorer': false,
      };
      givenWorkspaceFromTemplate('empty-server', options, done);
    });

    before(installSandboxPackages);

    let app;
    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('comes without loopback-component-explorer', function(done) {
      request(app).get('/explorer/swagger.json').expect(404, done);
    });
  });

  describe('api-server template', function() {
    let app;

    before(resetWorkspace);
    before(givenEmptySandbox);

    before(function createWorkspace(done) {
      givenWorkspaceFromTemplate('api-server', function(err) {
        debug('Created "api-server" in %s', SANDBOX);
        done(err);
      });
    });

    before(function createCustomModel(done) {
      models.ModelDefinition.create({
        facetName: 'common',
        name: 'Custom',
      }, function(err, model) {
        if (err) return done(err);
        model.properties.create({
          facetName: 'common',
          name: 'name',
          type: 'string',
          required: true,
        }, done);
      });
    });

    before(configureCustomModel);

    before(installSandboxPackages);

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('provides status on the root url', function(done) {
      request(app)
        .get('/')
        .expect(200, function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('uptime');
          done();
        });
    });

    it('has authentication enabled', function(done) {
      request(app)
        .get('/api/users')
        .expect(401, done);
    });

    it('has favicon enabled', function(done) {
      request(app)
        .get('/favicon.ico')
        .expect(200, done);
    });

    it('provides CORS headers for all URLs', function(done) {
      request(app).get('/')
        .set('X-Requested-By', 'XMLHttpRequest')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect(200, done);
    });

    it('provides security headers for all URLs ', function(done) {
      request(app).get('/')
        .expect('X-frame-options', 'DENY')
        .expect('x-xss-protection', '1; mode=block')
        .expect('x-content-type-options', 'nosniff')
        .expect('x-download-options', 'noopen')
        .expect(function(res) {
          const headers = res.headers;
          headers.should.not.have.property('x-powered-by');
        })
        .expect(200, done);
    });

    it('can create and login a user', function(done) {
      const credentials = {email: 'test@example.com', password: 'pass'};
      let userId, tokenId;
      async.waterfall([
        function createUser(next) {
          request(app)
            .post('/api/users')
            .send(credentials)
            .expect(200, function(err, res) {
              if (err) return next(err);
              userId = res.body.id;
              debug('created user with id %s', userId);
              next();
            });
        },
        function login(next) {
          request(app)
            .post('/api/users/login')
            .send(credentials)
            .expect(200, function(err, res) {
              if (err) return next(err);
              tokenId = res.body.id;
              debug('obtained access token with id %s', tokenId);
              next();
            });
        },
        function getMyAccount(next) {
          request(app)
            .get('/api/users/' + userId)
            .set('Authorization', tokenId)
            .expect(200, function(err, res) {
              if (err) return next(err);
              debug('my account', res.body);
              expect(res.body.id, 'my user id').to.equal(userId);
              next();
            });
        },
      ], done);
    });

    it('includes all built-in phases in `middleware.json`', function(done) {
      const builtinPhases = readBuiltinPhasesFromSanbox();

      const middleware = fs.readJsonSync(
        path.resolve(SANDBOX, 'server/middleware.json'),
      );
      const phaseNames = Object.keys(middleware).filter(isNameOfMainPhase);

      expect(phaseNames).to.eql(builtinPhases);
      done();

      function isNameOfMainPhase(name) {
        return !/:(before|after)$/.test(name);
      }
    });

    it.skipIf(IS_LEGACY_NODE, 'passes scaffolded tests', function(done) {
      execNpm(['test'], {cwd: SANDBOX}, function(err, stdout, stderr) {
        done(err);
      });
    });

    it('validates "updateOrCreate" data', function(done) {
      request(app).put('/api/customs')
        // it's important to include "id", otherwise updateOrCreate
        // short-circuits to regular create()
        .send({id: 999, name: ''})
        .expect(422)
        .end(done);
    });

    it('enables strictObjectIDCoercion for RoleMapping model', function() {
      expect(app.models.RoleMapping.settings.strictObjectIDCoercion)
        .to.equal(true);
    });
  });

  describe('notes template', function() {
    let app, modelInstance;

    before(resetWorkspace);
    before(givenEmptySandbox);

    before(function createWorkspace(done) {
      givenWorkspaceFromTemplate('notes', done);
    });

    before(installSandboxPackages);

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('applies acl on models', function(done) {
      request(app)
        .get('/api/Users')
        .expect(401, done);
    });

    it('provides retrieve operation', function(done) {
      request(app)
        .get('/api/Notes')
        .expect(200, done);
    });

    it('provides create operation', function(done) {
      const sample = {title: 'myTitle'};
      request(app)
        .post('/api/Notes')
        .send(sample)
        .expect(200, function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('title', 'myTitle');
          done();
        });
    });

    it('provides update operation', function(done) {
      const sample = {title: 'myTitle'};
      request(app)
        .put('/api/Notes')
        .send(sample)
        .expect(200, function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('title', 'myTitle');
          done();
        });
    });

    it('provides delete operation', function(done) {
      const Note = app.models.Note;
      Note.create({title: 'myTitle'}, function(error, note) {
        if (error) {
          done(error);
        } else {
          request(app)
            .delete('/api/Notes/' + note.id)
            .expect(200, function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.property('count', 1);
              done();
            });
        }
      });
    });

    it('enables strictObjectIDCoercion for RoleMapping model', function() {
      expect(app.models.RoleMapping.settings.strictObjectIDCoercion)
        .to.equal(true);
    });
  });

  describe('hello-world template', function() {
    let app, modelInstance;

    before(resetWorkspace);
    before(givenEmptySandbox);

    before(function createWorkspace(done) {
      givenWorkspaceFromTemplate('hello-world', done);
    });

    before(installSandboxPackages);

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('applies acl on models', function(done) {
      request(app)
        .get('/api/Users')
        .expect(401, done);
    });

    it('contains model "message"', function(done) {
      request(app)
        .get('/api/Messages/greet?msg=Tester')
        .expect(200, function(err, res) {
          if (err) return done(err);
          expect(res.body)
            .to.have.property('greeting', 'Sender says Tester to receiver');
          done();
        });
    });

    it('comes without built-in GET endpoint', function(done) {
      request(app)
        .get('/api/Messages')
        .expect(404, done);
    });

    it('enables strictObjectIDCoercion for RoleMapping model', function() {
      expect(app.models.RoleMapping.settings.strictObjectIDCoercion)
        .to.equal(true);
    });
  });

  describe('scaffold 3.x loopback project with option 3.x', function(done) {
    before(resetWorkspace);
    before(function createWorkspace(done) {
      const options = {loopbackVersion: '3.x'};
      givenWorkspaceFromTemplate('empty-server', options, done);
    });

    it('contains dependencies with 3.x version', function(done) {
      const dependencies = readPackageJsonSync().dependencies;
      // eslint-disable-next-line no-unused-expressions
      expect(semver.gtr('3.0.0', dependencies.loopback)).to.be.false;
      // eslint-disable-next-line no-unused-expressions
      expect(semver.gtr('3.0.0', dependencies['loopback-component-explorer']))
        .to.be.false;
      done();
    });

    it('comes without legacyExplorer flag in config.json', function(done) {
      const config = fs.readJsonSync(path.resolve(SANDBOX, 'server/config.json'));
      expect(config).to.not.have.property('legacyExplorer');
      done();
    });
  });

  describe('Check invalid version', function(done) {
    before(resetWorkspace);

    it('throws error with invalid version', function(done) {
      const options = {loopbackVersion: 'invalid-version'};
      givenWorkspaceFromTemplate('empty-server', options, function(err) {
        expect(err).to.match(/Loopback version should be 3\.x/);
        done();
      });
    });
  });

  function readPackageJsonSync() {
    const filepath = SANDBOX + '/package.json';
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  }

  describe('autoupdate', function() {
    this.timeout(10000);
    let connection;
    before(function(done) {
      connection = setupConnection(done);
    });

    after(function closeConnection(done) {
      connection.end(done);
    });

    before(givenBasicWorkspace);

    before(configureMySQLDataSource);

    before(addMySQLConnector);

    before(installSandboxPackages);

    before(function createCustomModel(done) {
      models.ModelDefinition.create({
        facetName: 'common',
        name: 'Custom',
        options: {
          mysql: {table: 'CUSTOM'},
        },
      }, done);
    });

    before(configureCustomModel);

    beforeEach(function resetMysqlDatabase(done) {
      listTableNames(connection, function(err, tables) {
        if (err) return done(err);
        async.eachSeries(tables, function(name, cb) {
          connection.query('DROP TABLE ??', [name], cb);
        }, done);
      });
    });

    /* eslint-disable one-var */
    let db;
    /* eslint-enable one-var */
    beforeEach(function findDb(done) {
      models.DataSourceDefinition.findOne(
        {where: {name: 'db'}},
        function(err, ds) {
          db = ds;
          done(err);
        },
      );
    });

    it('updates a single model in the database', function(done) {
      this.timeout(20000);
      db.autoupdate('Custom', function(err) {
        if (err) return done(err);
        listTableNames(connection, function(err, tables) {
          if (err) return done(err);
          expect(tables).to.match(/CUSTOM/i);
          done();
        });
      });
    });

    it.skipIf(platform.isWindows, 'updates all models in the database',
      function(done) {
        db.autoupdate(undefined, function(err) {
          if (err) return done(err);
          listTableNames(connection, function(err, tables) {
            if (err) return done(err);
            expect(tables).to.match(/CUSTOM/i);
            expect(tables).to.match(/User/i);
            expect(tables).to.match(/AccessToken/i);
            done();
          });
        });
      });
  });

  describe('discovery', function() {
    this.timeout(15000);

    let connection;
    before(function(done) {
      connection = setupConnection(done);
    });

    after(function closeConnection(done) {
      connection.end(done);
    });

    before(givenBasicWorkspace);

    before(configureMySQLDataSource);

    before(addMySQLConnector);

    before(installSandboxPackages);

    before(function createTable(done) {
      const sql = fs.readFileSync(
        path.join(
          __dirname, 'sql', 'create-simple-table.sql',
        ),
        'utf8',
      );

      connection.query(sql, done);
    });

    /* eslint-disable one-var */
    let db;
    /* eslint-enable one-var */
    beforeEach(function findDb(done) {
      models.DataSourceDefinition.findOne(
        {where: {name: 'db'}},
        function(err, ds) {
          db = ds;
          done(err);
        },
      );
    });

    describe('getSchema', function() {
      it('should include the simple table', function(done) {
        db.getSchema(function(err, schema) {
          if (err) return done(err);
          const tableNames = schema.map(function(item) { return item.name; });
          expect(tableNames).to.contain('simple');
          listTableNames(connection, function(err, tables) {
            if (err) return done(err);
            expect(tables.sort()).to.eql(tableNames.sort());
            done();
          });
        });
      });
    });

    describe('discoverModelDefinition', function() {
      it('should discover the simple table as a model', function(done) {
        db.discoverModelDefinition('simple', function(err, modelDefinition) {
          if (err) return done(err);
          expect(modelDefinition.name).to.equal('Simple');
          expect(modelDefinition.options.mysql.table).to.equal('simple');
          const props = Object.keys(modelDefinition.properties);
          expect(props.sort()).to.eql(['id', 'name', 'created'].sort());
          done();
        });
      });

      it('should set the correct base model', function(done) {
        db.discoverModelDefinition('simple', function(err, modelDefinition) {
          if (err) return done(err);
          expect(modelDefinition.base || modelDefinition.options.base)
            .to.equal('PersistedModel');
          done();
        });
      });
    });
  });

  describe('testConnection', function() {
    const DataSourceDefinition = models.DataSourceDefinition;

    before(givenBasicWorkspace);

    before(addMySQLConnector);

    before(installSandboxPackages);

    beforeEach(function resetWorkspace(done) {
      // delete all non-default datasources to isolate individual tests
      // use `nlike` instead of `neq` as the latter is not implemented yet
      // https://github.com/strongloop/loopback-datasource-juggler/issues/265
      DataSourceDefinition.destroyAll({name: {nlike: 'db'}}, done);
    });

    it('returns true for memory connector', function(done) {
      DataSourceDefinition.create(
        {
          facetName: 'server',
          name: 'test-memory-ds',
          connector: 'memory',
        },
        function(err, definition) {
          if (err) return done(err);
          definition.testConnection(function(err, connectionAvailable) {
            if (err) return done(err);
            // eslint-disable-next-line no-unused-expressions
            expect(connectionAvailable).to.be.true;
            done();
          });
        },
      );
    });

    it('returns descriptive error for unknown connector', function(done) {
      DataSourceDefinition.create(
        {
          facetName: 'server',
          name: 'test-unknown-ds',
          connector: 'connector-that-does-not-exist',
        },
        function(err, definition) {
          if (err) return done(err);
          definition.testConnection(function(err) {
            // eslint-disable-next-line no-unused-expressions
            expect(err, 'err').to.be.defined;
            expect(err.code, 'err.code').to.equal('ER_INVALID_CONNECTOR');
            expect(err.message, 'err.message')
              .to.contain('connector-that-does-not-exist');
            done();
          });
        },
      );
    });

    it('returns error when the test crashes', function(done) {
      // db is a valid dataSource, the method is invalid causing a crash
      const ds = new DataSourceDefinition({name: 'db'});
      ds.invokeMethodInWorkspace('nonExistingMethod', function(err) {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.exist;
        // Node compat: v0.10.x (call method) or v0.11.x (read property)
        expect(err.message)
          .to.match(/Cannot (call method|read property) 'apply' of/);
        done();
      });
    });

    describe('MySQL', function() {
      it('returns true for valid config', function(done) {
        this.timeout(20000);
        givenDataSource({}, function(err, definition) {
          if (err) return done(err);
          definition.testConnection(done);
        });
      });

      it('returns descriptive result for ECONNREFUSED', function(done) {
        givenDataSource(
          {
            port: 65000, // hopefully nobody is listening there
          },
          function(err, definition) {
            if (err) return done(err);
            definition.testConnection(function(err, status, pingError) {
              if (err) return done(err);
              // eslint-disable-next-line no-unused-expressions
              expect(status, 'status').to.be.false;
              // eslint-disable-next-line no-unused-expressions
              expect(pingError, 'pingError').to.exist;
              expect(pingError.code).to.equal('ECONNREFUSED');
              done();
            });
          },
        );
      });

      it('returns descriptive error for invalid credentials', function(done) {
        givenDataSource(
          {
            password: 'invalid-password',
          },
          function(err, definition) {
            if (err) return done(err);
            definition.testConnection(function(err, status, pingError) {
              if (err) return done(err);
              // eslint-disable-next-line no-unused-expressions
              expect(status, 'status').to.be.false;
              // eslint-disable-next-line no-unused-expressions
              expect(pingError, 'pingError').to.exist;
              expect(pingError.code).to.equal('ER_ACCESS_DENIED_ERROR');
              done();
            });
          },
        );
      });

      let dsid;
      function givenDataSource(config, cb) {
        config = extend({
          id: dsid,
          facetName: 'server',
          name: 'mysql',
          connector: 'mysql',
          port: null, // use default
          database: MYSQL_DATABASE,
          user: MYSQL_USER,
          password: MYSQL_PASSWORD,
        }, config);

        DataSourceDefinition.updateOrCreate(config, function(err, dsd) {
          if (!err)
            dsid = dsd.id;
          cb(err, dsd);
        });
      }
    });
  });

  describe('start/stop/restart', function() {
    // See api-server template used by `givenBasicWorkspace`
    let appUrl;

    // The tests are forking new processes and setting up HTTP servers,
    // they requires more than 2 seconds to finish
    this.timeout(20000);

    before(resetWorkspace);
    before(givenBasicWorkspace);
    before(installSandboxPackages);

    before(function addProductModel(done) {
      new TestDataBuilder()
        .define('productDef', models.ModelDefinition, {
          facetName: 'common',
          name: 'Product',
        })
        .define('productName', models.ModelProperty, {
          facetName: ref('productDef.facetName'),
          modelId: ref('productDef.id'),
          name: 'name',
          type: 'string',
        })
        .define('productConfig', models.ModelConfig, {
          facetName: 'server',
          name: ref('productDef.name'),
          dataSource: 'db',
        })
        .buildTo(this, done);
    });

    beforeEach(function setupServerHostAndPort(done) {
      given.uniqueServerPort(function(err, portEntry) {
        if (err) return done(err);
        given.facetSetting('server', 'host', 'localhost', function(err) {
          if (err) return done(err);
          appUrl = 'http://localhost:' + portEntry.value;
          done();
        });
      });
    });

    afterEach(function killWorkspaceChild(done) {
      // This is depending on Workspace internals to keep the test code simple
      if (!Workspace._child) return done();
      Workspace._child.once('exit', function() { done(); });
      Workspace._child.kill();
    });

    it('starts the app in the workspace', function(done) {
      request(workspace).post('/api/workspaces/start')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('pid');
          expect(res.body).to.have.property('host');
          expect(res.body).to.have.property('port');
          expectAppIsRunning(done);
        });
    });

    it('handles missing port and host config', function(done) {
      models.FacetSetting.deleteAll(
        {
          facetName: 'server',
          name: {inq: ['host', 'port']},
        }, function(err) {
          if (err) return done(err);

          request(workspace).post('/api/workspaces/start')
            .expect(200)
            .end(function(err) {
              if (err) return done(err);
              // localhost:3000 is the default value provided by loopback
              expectAppIsRunning('http://localhost:3000', done);
            });
        },
      );
    });

    it('stops the app started by the workspace', function(done) {
      models.Workspace.start(function(err) {
        if (err) return done(err);
        request(workspace).post('/api/workspaces/stop')
          .expect(200)
          .end(function(err) {
            if (err) return done(err);
            request(appUrl).get('/api/products')
              .end(function(err) {
                expect(err.message, 'err.message').to.contain('ECONNREFUSED');

                // Submitted a PR to supertest to get the code property attached
                // to the error: https://github.com/visionmedia/supertest/pull/530
                // If accepted, revert test to the commented one below:
                // expect(err).to.have.property('code', 'ECONNREFUSED');
                done();
              });
          });
      });
    });

    it('does not start more than one process', function(done) {
      models.Workspace.start(function(err, res) {
        if (err) return done(err);
        const pid = res.pid;
        models.Workspace.start(function(err, res) {
          if (err) return done(err);
          expect(res.pid).to.equal(pid);
          done();
        });
      });
    });

    it('allows stop to be called multiple times', function(done) {
      models.Workspace.start(function(err) {
        if (err) return done(err);
        models.Workspace.stop(function(err) {
          if (err) return done(err);
          models.Workspace.stop(function(err) {
            if (err) return done(err);
            // no assert, the test passed when we got here
            done();
          });
        });
      });
    });

    it('restarts the app', function(done) {
      models.Workspace.start(function(err, res) {
        if (err) return done(err);
        const pid = res.pid;

        request(workspace).post('/api/workspaces/restart')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.pid).to.be.a('number');
            expect(res.body.pid).to.not.equal(pid);
            done();
          });
      });
    });

    it('returns status for app not running', function(done) {
      request(workspace).get('/api/workspaces/is-running')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.eql({
            running: false,
          });
          done();
        });
    });

    it('returns status for a running app', function(done) {
      models.Workspace.start(function(err, res) {
        if (err) return done(err);
        const pid = res.pid;

        request(workspace).get('/api/workspaces/is-running')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              running: true,
              pid: pid,
            });
            done();
          });
      });
    });

    it('does not forward env.PORT', function(done) {
      process.env.PORT = 80;
      models.Workspace.start(function(err) {
        delete process.env.PORT;
        if (err) return done(err);
        expectAppIsRunning(done);
      });
    });

    it('does not forward env.HOST', function(done) {
      process.env.HOST = 'invalid-hostname';
      models.Workspace.start(function(err) {
        delete process.env.PORT;
        if (err) return done(err);
        expectAppIsRunning(done);
      });
    });

    function expectAppIsRunning(appBaseUrl, done) {
      if (typeof appBaseUrl === 'function' && done === undefined) {
        done = appBaseUrl;
        appBaseUrl = appUrl;
      }

      request(appBaseUrl).get('/api/products')
        .expect(200)
        .end(done);
    }
  });
});

function setupConnection(done) {
  const connection = mysql.createConnection({
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
  });

  connection.connect(function(err) {
    if (!err) return done(err);
    if (err.code === 'ECONNREFUSED') {
      err = new Error(
        'Cannot connect to local MySQL database, ' +
          'make sure you have `mysqld` running on your machine',
      );
    } else {
      console.error();
      console.error('**************************************');
      console.error('Cannot connect to MySQL.');
      console.error('Setup the test environment by running');
      console.error('    node bin/setup-mysql');
      console.error('**************************************');
      console.error();
    }
    done(err);
  });

  return connection;
}

function execNpm(args, options, cb) {
  const debug = require('debug')('test:exec-npm');
  options = options || {};
  options.env = extend(
    {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
    },
    options.env,
  );

  const command = 'npm ' + args.join(' ');
  debug(command);
  return exec(command, options, function(err, stdout, stderr) {
    debug('--npm stdout--\n%s\n--npm stderr--\n%s\n--end--',
      stdout, stderr);
    cb(err, stdout, stderr);
  });
}

function installSandboxPackages(cb) {
  this.timeout(300 * 1000);
  initializePackage();
  localInstall(SANDBOX, cb);
}

function listTableNames(connection, cb) {
  connection.query('SHOW TABLES', function(err, list, fields) {
    if (err) return cb(err);
    const tables = list.map(function(row) {
      // column name is e.g. 'Tables_in_loopback_workspace_test'
      return row[fields[0].name];
    });
    cb(null, tables);
  });
}

function configureMySQLDataSource(done) {
  models.DataSourceDefinition.findOne(
    {where: {name: 'db'}},
    function(err, ds) {
      if (err) return done(err);
      ds.connector = 'mysql';
      // settings prepared by test/helpers/setup-mysql.js
      ds.database = MYSQL_DATABASE;
      ds.user = MYSQL_USER;
      ds.password = MYSQL_PASSWORD;
      ds.save(done);
    },
  );
}

function addMySQLConnector(done) {
  models.PackageDefinition.findOne({}, function(err, pkg) {
    if (err) return done(err);
    pkg.dependencies['loopback-connector-mysql'] = '1.x';
    pkg.save(done);
  });
}

function configureCustomModel(done) {
  models.ModelConfig.create({
    name: 'Custom',
    dataSource: 'db',
    facetName: 'server',
  }, done);
}

function readBuiltinPhasesFromSanbox() {
  const loopback = require(SANDBOX + '/node_modules/loopback');
  const app = loopback();
  app.lazyrouter(); // initialize request handling phases
  return app._requestHandlingPhases;
}

function bootSandboxWithOptions(options, done) {
  const loopback = require(SANDBOX + '/node_modules/loopback');
  const boot = require(SANDBOX + '/node_modules/loopback-boot');
  const app = loopback({localRegistry: true, loadBuiltinModels: true});
  const bootOptions = extend({
    appRootDir: SANDBOX + '/server',
  }, options);

  boot(app, bootOptions, function(err) {
    done(err, app);
  });
}

function localInstall(cwd, cb) {
  const options = {
    cwd: cwd,
  };
  const script = 'npm install --package-lock';
  debug('Running `%s` in %s', script, cwd);
  return exec(script, options, function(err, stdout, stderr) {
    debug('--npm stdout--\n%s\n--npm stderr--\n%s\n--end--',
      stdout, stderr);
    cb(err);
  });
}

function initializePackage() {
  // npm install works for windows consistently only
  // when node_modules folder is available in the working dir
  fs.mkdirSync(path.join(SANDBOX, 'node_modules'));
}
