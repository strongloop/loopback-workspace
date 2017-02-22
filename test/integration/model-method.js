// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const app = require('../../');
const expect = require('../helpers/expect');
const fs = require('fs-extra');
const testSupport = require('../helpers/test-support');
const ModelDefinition = app.models.ModelDefinition;
const ModelMethod = app.models.ModelMethod;
const WorkspaceManager = require('../../component/workspace-manager');

describe('ModelMethod', function() {
  let userModel;

  beforeEach(function(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  });

  beforeEach(function(done) {
    ModelDefinition.create(
      {
        id: 'server.models.user',
        name: 'user',
        facetName: 'server',
      },
      function(err, result) {
        if (err) return done(err);
        userModel = result;
        done();
      });
  });

  it('add static method', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'testMethod',
        isStatic: true,
      },
      function(err) {
        if (err) return done(err);
        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          expect(list[0]).to.
            have.property('id', 'server.models.user.testMethod');
          expect(list[0]).to.have.property('isStatic', true);
          const dir = testSupport.givenSandboxDir('empty-server');
          const model =
            WorkspaceManager.getWorkspaceByFolder(dir).getModel(userModel.id);
          const file = model.getFilePath();
          fs.readJson(file, function(err, data) {
            if (err) return done(err);
            var methods = data.methods;
            expect(methods).to.be.an('object');
            expect(methods).to.have.property('testMethod');
            expect(methods).to.not.have.property('prototype.testMethod');
            expect(methods.testMethod).to.not.have.property('id');
            expect(methods.testMethod).to.not.have.property('facetName');
            expect(methods.testMethod).to.not.have.property('name');
            done();
          });
        });
      });
  });
});
