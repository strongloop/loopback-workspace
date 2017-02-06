// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const expect = require('lodash').expect;
const fs = require('fs-extra');
const path = require('path');
const request = require('supertest');
const testSupport = require('../helpers/test-support');

describe('end-to-end', function() {
  describe('api-server template', function() {
    this.timeout(50000);
    let app;
    const dir = testSupport.givenSandboxDir('api-server');
    before(function loadApp(done) {
      testSupport.installSandboxPackages(dir, function(err) {
        if (err) return done(err);
        app = require(dir);
        done();
      });
    });

    it('provides status on the root url', function(done) {
      request(app)
        .get('/')
        .expect(200, function(err, res) {
          if (err) return done(err);
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
        .expect('Access-Control-Allow-Origin',  'http://example.com')
        .expect(200, done);
    });
  });
  describe('hello-world template', function() {
    this.timeout(50000);
    let app;
    const dir = testSupport.givenSandboxDir('hello-world');
    before(function loadApp(done) {
      testSupport.installSandboxPackages(dir, function(err) {
        if (err) return done(err);
        app = require(dir);
        done();
      });
    });

    it('provides status on the root url', function(done) {
      request(app)
        .get('/')
        .expect(200, function(err, res) {
          if (err) return done(err);
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
        .expect('Access-Control-Allow-Origin',  'http://example.com')
        .expect(200, done);
    });
  });
});
