// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const app = require('../../');
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const testSupport = require('../helpers/test-support');
const loopback = require('loopback');
const Facet = app.models.Facet;
const WorkspaceManager = require('../../lib/workspace-manager');

describe('Facet', function() {
  describe('CRUD', function() {
    let workspace, dir;
    before(createWorkspace);

    it('model.create()', function(done) {
      Facet.create({
        name: 'foo',
      }, function(err, def) {
        if (err) return done(err);
        expect(err).to.not.exist();
        expect(def).to.not.have.ownProperty('id');
        expect(def.name).to.equal('foo');
        done();
      });
    });

    it('omits `name` in config.json', function() {
      var content = fs.readJsonSync(dir + '/foo/config.json');
      expect(content).to.not.have.property('name');
    });

    it('omits `modelsMetadata` in config.json', function() {
      var content = fs.readJsonSync(dir + '/foo/config.json');
      expect(content).to.not.have.property('modelsMetadata');
    });

    it('includes `_meta.source` in model-config.json', function() {
      var content = fs.readJsonSync(dir + '/foo/model-config.json');
      expect(content).to.have.property('_meta');
      expect(content._meta).to.eql({
        sources: [
          'loopback/common/models',
          'loopback/server/models',
          '../common/models',
          './models',
        ],
        mixins: [
          'loopback/common/mixins',
          'loopback/server/mixins',
          '../common/mixins',
          './mixins',
        ],
      });
    });

    it('saves facet models to correct file', function() {
      var serverModels = fs.readJsonSync(dir + '/foo/model-config.json');
      expect(Object.keys(serverModels), 'server models').to.not.be.empty();
    });

    function createWorkspace(done) {
      testSupport.givenBasicWorkspace('empty-server', function(err) {
        if (err) return done(err);
        workspace = WorkspaceManager.getWorkspace();
        dir = workspace.getDirectory();
        done();
      });
    }
  });
});
