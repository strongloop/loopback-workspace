// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const app = require('../../');
const expect = require('../helpers/expect');
const testSupport = require('../helpers/test-support');
const loopback = require('loopback');
const Facet = app.models.Facet;
const Middleware = app.models.Middleware;
const MiddlewarePhase = app.models.MiddlewarePhase;
const WorkspaceManager = require('../../lib/workspace-manager');

describe('Middleware', function() {
  before(function(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  });

  describe('CRUD', function() {
    let initialCount = 0;

    before(function(done) {
      Middleware.find(function(err, defs) {
        if (err) return done(err);
        initialCount = defs.length;
        done();
      });
    });

    it('model.create()', function(done) {
      async.series([function(next) {
        Middleware.create({
          facetName: 'server',
          function: 'foo',
          paths: ['/foo'],
          params: {
            fooParam: 'foo',
          },
          phase: 'routes',
        }, next);
      }, function(next) {
        Middleware.create({
          facetName: 'server',
          function: 'foo-before',
          methods: ['get', 'post'],
          paths: ['/foo-before'],
          params: {
            barParam: 'foo-before',
          },
          phase: 'routes',
          subPhase: 'before',
        }, next);
      }], done);
    });

    it('model.find()', function(done) {
      Middleware.find(function(err, defs) {
        if (err) return done(err);
        expect(defs).to.have.length(initialCount);
        done();
      });
    });

    describe('MiddlewarePhase.create()', function() {
      it('should add a phase before a phase', function(done) {
        const config = {};
        config.name = 'phase1';
        config.before = 'routes';
        config.facetName = 'server';

        MiddlewarePhase.create(config, function(err) {
          if (err) return done(err);
          const workspace = WorkspaceManager.getWorkspace();
          const facet = workspace.facets(config.facetName);
          const index = facet.middlewares('middleware')
            .phases().order.indexOf(config.name);
          expect(index).to.be.greaterThan(-1);
          done();
        });
      });

      it('should not add a phase if it exists', function(done) {
        const config = {};
        config.name = 'phase1';
        config.before = 'routes';
        config.facetName = 'server';

        MiddlewarePhase.create(config, function(err) {
          if (err && err.toString().includes('exists')) return done();
          done('did not catch error');
        });
      });

      it('should add phase after the last phase', function(done) {
        const config = {};
        config.name = 'myPhase';
        config.index = -1;
        config.facetName = 'server';

        const workspace = WorkspaceManager.getWorkspace();
        const facet = workspace.facets(config.facetName);
        const lastIndex = facet.middlewares('middleware').phases().map().length;
        MiddlewarePhase.create(config, function(err) {
          if (err) return done(err);
          const index =
            facet.middlewares('middleware').phases().map().map(function(data) {
              return data.id;
            }).indexOf(config.name);
          expect(index).to.be.equal(lastIndex + 1);
          done();
        });
      });

      it('add middleware to custom phase', function(done) {
        async.series([function(next) {
          Middleware.create({
            facetName: 'server',
            function: 'foo',
            paths: ['/foo'],
            params: {
              fooParam: 'foo',
            },
            phase: 'phase1',
          }, next);
        }, function(next) {
          Middleware.create({
            facetName: 'server',
            function: 'foo-before',
            methods: ['get', 'post'],
            paths: ['/foo-before'],
            params: {
              barParam: 'foo-before',
            },
            phase: 'myPhase',
            subPhase: 'before',
          }, next);
        }], done);
      });
    });
  });
});
