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
const WorkspaceManager = require('../../lib/workspace-manager');
var request = require('supertest');

describe('ModelProperty', function() {
  let userModel, propertyName, property;

  before(function(done) {
    testSupport.givenBasicWorkspace('empty-server', done);
  });

  before(function(done) {
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
    it('model.find()', function(done) {
      userModel.properties(function(err, array) {
        expect(err).to.not.exist();
        expect(array.length).to.be.greaterThan(0);
        property = array[0];
        const properties = array.map(function(entity) {
          return entity.name;
        });
        expect(properties).to.contain(propertyName);
        done();
      }.bind(this));
    });
    it('model.save()', function(done) {
      var AN_ORACLE_CONFIG = {
        columnName: 'ID',
        dataType: 'VARCHAR2',
        dataLength: 20,
        nullable: 'N',
      };
      property.type = 'Boolean';
      property.isId = true;
      property.oracle = AN_ORACLE_CONFIG;
      property.save(function(err) {
        const dir = testSupport.givenSandboxDir('empty-server');
        const model =
          WorkspaceManager.getWorkspaceByFolder(dir).model(userModel.id);
        const file = model.getFilePath();
        fs.readJson(file, function(err, data) {
          if (err) return done(err);
          const properties = data.properties;
          expect(properties[propertyName]).to.eql({
            type: 'Boolean',
            isId: true,
            oracle: AN_ORACLE_CONFIG});
          done();
        });
      });
    });
  });
});
