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
const ModelProperty = app.models.ModelProperty;
const WorkspaceManager = require('../../component/workspace-manager');
var request = require('supertest');

describe('ModelProperty', function() {
  let userModel, propertyName, property;

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

  describe('CRUD', function(done) {
    it('model.create()', function(done) {
      propertyName = 'myProperty';
      const def = {
        name: propertyName,
        type: 'String',
        isId: false,
        modelId: userModel.id,
      };
      ModelProperty.create(def, function(err, data) {
        if (err) return done(err);
        expect(Object.keys(data.toObject())).to.include.members([
          'modelId',
          'type',
          'name',
        ]);
        done();
      });
    });
  });
});
