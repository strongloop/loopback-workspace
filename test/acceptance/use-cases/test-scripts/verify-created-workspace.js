// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const expect = require('lodash').expect;
const fs = require('fs-extra');
const path = require('path');
const request = require('supertest');
const testSupport = require('../../../helpers/test-support');

module.exports = function() {
  const testName = 'LoadWorkspace';
  let templateName, app;

  this.When(/^I boot the '(.+)' workspace$/,
  function(name, next) {
    templateName = name;
    const dir = testSupport.givenSandboxDir(templateName);
    testSupport.installSandboxPackages(dir, function(err) {
      if (err) return next(err);
      app = require(dir);
      next();
    });
  });

  this.Then(/^it provides status on the root url$/, function(next) {
    request(app)
      .get('/')
      .expect(200, function(err, res) {
        if (err) return next(err);
        next();
      });
  });

  this.Then(/^it provides status on the root url only$/, function(next) {
    // See https://github.com/strongloop/generator-loopback/issues/80
    request(app)
      .get('/does-not-exist')
      .expect(404, next);
  });

  this.Then(/^it has favicon enabled$/, function(next) {
    request(app)
      .get('/favicon.ico')
      .expect(200, next);
  });

  this.Then(/^it provides CORS headers for all URLs$/, function(next) {
    request(app).get('/')
      .set('X-Requested-By', 'XMLHttpRequest')
      .set('Origin', 'http://example.com')
      .expect('Access-Control-Allow-Origin',  'http://example.com')
      .expect(200, next);
  });
};
