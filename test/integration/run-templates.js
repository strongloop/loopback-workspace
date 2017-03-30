// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const app = require('../../');
const extend = require('lodash').extend;
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const request = require('supertest');
const testSupport = require('../helpers/test-support');
const WorkspaceManager = app.WorkspaceManager;

describe('check-template', function() {
  this.timeout(50000);
  let app, sandbox;

  describe('run sample template', function() {
    before(createWorkspace);
    before(installPackages);

    it('provides status on the root url', function() {
      return request(app)
        .get('/')
        .expect(200)
        .then(function(res) {
          expect(res.body).to.have.property('uptime');
        });
    });

    it('provides status on the root url only', function() {
      // See https://github.com/strongloop/generator-loopback/issues/80
      return request(app)
        .get('/does-not-exist')
        .expect(404);
    });

    it('has favicon enabled', function() {
      return request(app)
        .get('/favicon.ico')
        .expect(200);
    });

    it('provides CORS headers for all URLs', function() {
      return request(app)
        .get('/')
        .set('X-Requested-By', 'XMLHttpRequest')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin',  'http://example.com')
        .expect(200);
    });

    it('provides security headers for all URLs ', function() {
      return request(app)
        .get('/')
        .expect('x-frame-options', 'DENY')
        .expect('x-xss-protection', '1; mode=block')
        .expect('x-content-type-options', 'nosniff')
        .expect(200);
    });

    it('comes with loopback-component-explorer', function() {
      return request(app)
        .get('/explorer/swagger.json')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('omits sensitive error details in production mode', function() {
      const bootOptions = {
        env: 'production',
      };
      bootSandboxWithOptions(sandbox, bootOptions, function(err, app) {
        if (err) throw err;
        return request(app)
          .get('/url-does-not-exist')
          .expect(404)
          .then(function(res) {
            // Assert that the response body does not contain stack trace.
            // We want the assertion to be robust and keep working even
            // if the property name storing stack trace changes in the future,
            // therefore we test full response body.
            const responseBody = JSON.stringify(res.body);
            expect(responseBody).to.not.include('stack');
          });
      });
    });
  });

  function createWorkspace(done) {
    testSupport.givenBasicWorkspace('api-server', done);
    testSupport.clearWorkspaces();
  }
  function installPackages(done) {
    sandbox = testSupport.givenSandboxDir('api-server');
    const workspace = WorkspaceManager.getWorkspace();
    testSupport.installSandboxPackages(sandbox, function(err) {
      if (err) return done(err);
      app = require(sandbox);
      done();
    });
  }
});

function bootSandboxWithOptions(sandbox, options, done) {
  const loopback = require(sandbox + '/node_modules/loopback');
  const boot = require(sandbox + '/node_modules/loopback-boot');
  const app = loopback({localRegistry: true, loadBuiltinModels: true});
  const bootOptions = extend({
    appRootDir: sandbox + '/server',
  }, options);

  boot(app, bootOptions, function(err) {
    done(err, app);
  });
}
