// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const app = require('../');
const ConfigFile = app.models.ConfigFile;
const ModelDefinition = app.models.ModelDefinition;
const ModelMethod = app.models.ModelMethod;
const TestDataBuilder = require('./helpers/test-data-builder');
const expect = require('chai').expect;
const support = require('./support');
const givenBasicWorkspace = support.givenBasicWorkspace;
const givenLB3Workspace = support.givenLB3Workspace;

describe('ModelMethod', function() {
  let userModel;

  beforeEach(givenBasicWorkspace);
  beforeEach(function(done) {
    ModelDefinition.create(
      {
        name: 'user',
        facetName: 'server',
      },
      function(err, result) {
        if (err) return done(err);
        userModel = result;
        done();
      }
    );
  });

  it('is represented as a key-value map in model definition', function(done) {
    const cfg = new ConfigFile({path: 'server/models/user.json'});
    cfg.load(function(err) {
      if (err) return done(err);
      // eslint-disable-next-line no-undef
      expect(cfg.data.methods).to.be.an('object');
      done();
    });
  });

  it('supports multiple http endpoints', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'multiMethod',
        isStatic: true,
        http: [
          {verb: 'get', path: '/get'},
          {verb: 'head', path: '/head'},
        ],
      },
      function(err) {
        if (err) return done(err);

        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          const method = list[0];
          expect(method).to.have.property('name', 'multiMethod');
          expect(method).to.have.property('http').to.have.length(2);
          expect(method.http[0]).to.eql({verb: 'get', path: '/get'});
          expect(method.http[1]).to.eql({verb: 'head', path: '/head'});

          const cfg = new ConfigFile({path: 'server/models/user.json'});
          cfg.load(function(err) {
            if (err) return done(err);
            const methods = cfg.data.methods;
            expect(methods).to.have.property('multiMethod');
            expect(methods.multiMethod).to.have.property('http').eql([
              {verb: 'get', path: '/get'},
              {verb: 'head', path: '/head'},
            ]);
            done();
          });
        });
      }
    );
  });
});

describe('ModelMethod - Loopback 3.0', function() {
  let userModel;

  beforeEach(givenLB3Workspace);

  beforeEach(function(done) {
    ModelDefinition.create(
      {
        name: 'user',
        facetName: 'server',
      },
      function(err, result) {
        if (err) return done(err);
        userModel = result;
        done();
      }
    );
  });

  it('add static method without isStatic flag to method definition', function(done) {
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
          expect(list[0]).to.have.property('name', 'testMethod');
          expect(list[0]).to.have.property('isStatic', true);

          const cfg = new ConfigFile({path: 'server/models/user.json'});
          cfg.load(function(err) {
            if (err) return done(err);
            const methods = cfg.data.methods;
            expect(methods).to.be.an('object');
            expect(methods).to.have.property('testMethod');
            expect(methods).to.not.have.property('prototype.testMethod');
            expect(methods.testMethod).to.not.have.property('isStatic');
            expect(methods.testMethod).to.not.have.property('id');
            expect(methods.testMethod).to.not.have.property('facetName');
            expect(methods.testMethod).to.not.have.property('name');
            done();
          });
        });
      }
    );
  });

  it('add `prototype.` to method name if isStatic flag is false', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'testMethod',
        isStatic: false,
      },
      function(err) {
        if (err) return done(err);
        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          expect(list[0]).to.have.property('name', 'testMethod');
          expect(list[0]).to.have.property('isStatic', false);

          const cfg = new ConfigFile({path: 'server/models/user.json'});
          cfg.load(function(err) {
            if (err) return done(err);
            const methods = cfg.data.methods;
            expect(methods).to.be.an('object');
            expect(methods).to.have.property('prototype.testMethod');
            expect(methods).to.not.have.property('testMethod');
            expect(methods['prototype.testMethod']).to.not.have.property('isStatic');
            expect(methods['prototype.testMethod']).to.not.have.property('id');
            expect(methods['prototype.testMethod']).to.not.have.property('facetName');
            expect(methods['prototype.testMethod']).to.not.have.property('name');
            done();
          });
        });
      }
    );
  });

  it('loading JSON should have correct method name and isStatic flag', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'testMethod',
        isStatic: false,
        http: [
          {verb: 'get', path: '/get'},
          {verb: 'head', path: '/head'},
        ],
      },
      function(err) {
        if (err) return done(err);
        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          expect(list[0]).to.have.property('name', 'testMethod');
          expect(list[0]).to.have.property('isStatic');

          ModelMethod.find(function(err, methods) {
            if (err) return done(err);
            expect(methods[0]).to.have.property('name', 'testMethod');
            expect(methods[0]).to.not.have.property('name', 'prototype.testMethod');
            expect(methods[0]).to.have.property('isStatic', false);
            done();
          });
        });
      }
    );
  });
});
