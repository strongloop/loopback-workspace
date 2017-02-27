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
var Facet = app.models.Facet;
var Middleware = app.models.Middleware;

describe('Middleware', function() {
  describe('CRUD', function() {
    let initialCount = 0;

    before(function(done) {
      testSupport.givenBasicWorkspace('empty-server', done);
    });
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
          function: 'foo',
          paths: ['/foo'],
          params: {
            fooParam: 'foo',
          },
          phase: 'routes',
        }, next);
      }, function(next) {
        Middleware.create({
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
        expect(defs).to.have.length(initialCount + 2);
        done();
      });
    });
  });
});
