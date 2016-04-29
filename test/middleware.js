// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var util = require('util');
var async = require('async');
var app = require('../');
var loopback = require('loopback');
var ConfigFile = app.models.ConfigFile;
var Middleware = app.models.Middleware;
var Facet = app.models.Facet;
var TestDataBuilder = require('./helpers/test-data-builder');

describe('Middleware', function() {
  describe('Middleware.create(def, cb)', function() {
    beforeEach(givenEmptyWorkspace);
    beforeEach(function(done) {
      var serverFacet = this.serverFacet;
      this.configFile = new ConfigFile({
        path: serverFacet + '/middleware.json',
      });
      async.series([function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'foo',
          paths: ['/foo'],
          params: {
            fooParam: 'foo',
          },
          phase: 'routes',
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'foo-before',
          methods: ['get', 'post'],
          paths: ['/foo-before'],
          params: {
            barParam: 'foo-before',
          },
          phase: 'routes',
          subPhase: 'before',
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'bar',
          paths: ['/bar'],
          params: {
            barParam: 'bar',
          },
          phase: 'routes',
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'xyz',
          paths: ['/xyz'],
          params: {
            xyzParam: 'xyz',
          },
          phase: 'files',
          index: 0,
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'xyz',
          paths: ['/xyz1'],
          params: {
            xyzParam: 'xyz1',
          },
          phase: 'files',
          index: 1,
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'dummy',
          phase: 'files',
          isMiddlewarePlaceHolder: true,
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          isPhasePlaceHolder: true,
          phase: 'myPhase',
        }, done);
      }, function(done) {
        Middleware.addMiddleware({
          facetName: serverFacet,
          name: 'baz',
          paths: ['/baz'],
          params: {
            barParam: 'baz',
          },
          phase: 'auth',
          nextPhase: 'routes',
        }, done);
      }], done);
    });

    beforeEach(function(done) {
      this.configFile.load(done);
    });

    it('should be able to create multiple entries', function(done) {
      Middleware.find(function(err, defs) {
        expect(defs).to.have.length(11);
        var middleware = defs.filter(function(m) {
          return !m.isPhasePlaceHolder;
        });
        expect(middleware).to.have.length(7);
        // Convert to json for eql comparison, otherwise List != []
        var m = middleware[6].toJSON();
        expect(m.paths).to.eql(['/foo-before']);
        expect(m.methods).to.eql(['get', 'post']);
        expect(m.params).to.eql({ barParam: 'foo-before' });
        done();
      });
    });

    describe('config file', function() {
      it('should be created', function(done) {
        this.configFile.exists(function(err, exists) {
          expect(err).to.not.exist;
          expect(exists).to.equal(true);
          done();
        });
      });

      it('should not contain id properties', function() {
        var configData = this.configFile.data;
        var dsConfig = configData.routes.foo;
        expect(dsConfig).to.not.have.property('id');
        expect(dsConfig).to.not.have.property('facetName');
      });

      it('should contain phase place holder', function() {
        var configData = this.configFile.data;
        expect(configData.myPhase).exist;
        expect(Object.keys(configData.myPhase)).to.eql([]);
      });

      it('should allow array value', function() {
        var configData = this.configFile.data;
        expect(configData.files).exist;
        expect(configData.files.xyz).to.be.array;
        expect(configData.files.xyz.length).to.eql(2);
      });

      it('should allow empty array value', function() {
        var configData = this.configFile.data;
        expect(configData.files).exist;
        expect(configData.files.dummy).to.be.array;
        expect(configData.files.dummy.length).to.eql(0);
      });
    });

    it('should keep the order of entries', function(done) {
      var defs = this.configFile.data;
      expect(Object.keys(defs)).to.eql(
        ['auth', 'routes:before', 'routes', 'files', 'myPhase']);
      var routes = defs.routes;
      expect(Object.keys(routes)).to.eql(['foo', 'bar']);
      done();
    });

    it('should not contain workspace-private properties', function(done) {
      var configFile = this.configFile;
      Middleware.create({
        name: 'another-middleware',
        params: { x: 'rest' },
        facetName: this.serverFacet,
      }, function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) done(err);
          var middlewares = configFile.data;
          expect(Object.keys(middlewares.routes.foo)).to.not.contain('configFile');
          done();
        });
      });
    });

    it('should add phase after a given phase', function(done) {
      var configFile = this.configFile;
      Middleware.addPhase(this.serverFacet, 'phase1', 'routes', function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) done(err);
          var middlewares = configFile.data;
          expect(Object.keys(middlewares)).to.eql(
            ['auth', 'phase1', 'routes:before', 'routes', 'files', 'myPhase']);
          done();
        });
      });
    });

    it('should not add a phase if it exists', function(done) {
      var configFile = this.configFile;
      Middleware.addPhase(this.serverFacet, 'myPhase', 'routes', function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) done(err);
          var middlewares = configFile.data;
          expect(Object.keys(middlewares)).to.eql(
            ['auth', 'routes:before', 'routes', 'files', 'myPhase']);
          done();
        });
      });
    });

    it('should add phase after the last phase', function(done) {
      var configFile = this.configFile;
      Middleware.addPhase(this.serverFacet, 'phase1', null, function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) done(err);
          var middlewares = configFile.data;
          expect(Object.keys(middlewares)).to.eql(
            ['auth', 'routes:before', 'routes', 'files', 'myPhase', 'phase1']);
          done();
        });
      });
    });
  });

  it('validates `name` uniqueness within the facet only', function(done) {
    var ref = TestDataBuilder.ref;
    new TestDataBuilder()
      .define('facet1', Facet, {
        name: 'facet1',
      })
      .define('facet2', Facet, {
        name: 'facet2',
      })
      .define('facet1middleware', Middleware, {
        name: 'mname',
        facetName: ref('facet1.name'),
      })
      .define('facet2middleware', Middleware, {
        name: ref('facet1middleware.name'),
        facetName: ref('facet2.name'),
      })
      .buildTo({}, function(err) {
        if (err && err.name === 'ValidationError') {
          err.message += '\nDetails: ' +
            JSON.stringify(err.details.messages, null, 2);
        }
        // The test passes when no error was reported.
        done(err);
      });
  });

  describe('middleware.configFile', function() {
    beforeEach(givenBasicWorkspace);
    beforeEach(findMiddlewares);

    it('should be defined', function() {
      this.middlewares.forEach(function(def) {
        expect(def.configFile).to.equal('server/middleware.json');
      });
    });
  });
});
