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
const DataSource = loopback.DataSource;
const DataSourceDefinition = app.models.DataSourceDefinition;

describe('DataSourceDefinition', function() {
  describe('DataSourceDefinition.create(def, cb)', function() {
    beforeEach(function(done) {
      testSupport.givenBasicWorkspace('empty-server', done);
    });
    it('should be able to create multiple', function(done) {
      function callback(err) {
        if (err) return done(err);
        DataSourceDefinition.find(function(err, defs) {
          if (err) return done(err);
          expect(defs).to.have.length(3);
          done();
        });
      }

      async.parallel([
        function(cb) {
          DataSourceDefinition.create({
            facetName: 'server',
            name: 'foo',
            connector: 'memory',
          }, cb);
        },
        function(cb) {
          DataSourceDefinition.create({
            facetName: 'server',
            name: 'bar',
            connector: 'memory',
          }, cb);
        }], callback);
    });
  });
});
