// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../');
var request = require('supertest');

describe('REST API', function() {
  beforeEach(givenEmptySandbox);

  describe('/workspaces', function() {
    beforeEach(resetWorkspace);

    describe('POST /workspaces', function() {
      beforeEach(function createWorkspaceFromTemplate(done) {
        request(app)
          .post('/api/workspaces')
          .set('Content-Type', 'application/json')
          .send({
            templateName: 'api-server',
            name: 'sandbox',
          })
          .expect(204)
          .end(function(err, res) {
            console.log(res.body);
            done(err);
          });
      });
      it('should add a facet from a template', function(done) {
        app.models.Facet.find(function(err, defs) {
          if (err) return done(err);
          var names = toNames(defs);
          expect(names).to.contain('server');
          done();
        });
      });
    });

    /***
     ***   SKIP UNTIL NON ROOT COMPONENT SUPPORT IS ADDED   ***
     ***/

    describe.skip('POST /workspaces/component', function() {
      beforeEach(function(done) {
        request(app)
          .post('/api/workspaces/component')
          .set('Content-Type', 'application/json')
          .send({
            template: 'rest',
          })
          .end(done);
      });
      it('should add a component from a template', function(done) {
        app.models.ComponentDefinition.find(function(err, defs) {
          expect(toNames(defs)).to.contain('rest');
          done();
        });
      });
    });

    describe('POST /workspaces/connectors', function() {
      beforeEach(givenEmptyWorkspace);
      beforeEach(function(done) {
        this.req = request(app)
          .get('/api/workspaces/connectors')
          .set('Accepts', 'application/json')
          .end(done);
      });
      it('should return a list of connectors', function() {
        var connectors = toNames(this.req.res.body);
        expect(connectors).to.contain('memory');
        expect(connectors).to.contain('mail');
        expect(connectors).to.contain('mysql');
        expect(connectors).to.contain('postgresql');
        expect(connectors).to.contain('oracle');
        expect(connectors).to.contain('mssql');
        expect(connectors).to.contain('mongodb');
        expect(connectors).to.contain('soap');
        expect(connectors).to.contain('rest');
        expect(connectors).to.contain('neo4j');
        expect(connectors).to.contain('kafka');
      });
    });

    describe('POST /api/DataSourceDefinitions', function() {
      beforeEach(givenEmptyWorkspace);
      beforeEach(function(done) {
        this.req = request(app)
          .post('/api/DataSourceDefinitions')
          .set('Accepts', 'application/json')
          .send({
            'defaultForType': 'mysql',
            'name': 'test',
            'connector': 'loopback-connector-mysql',
            'host': 'demo.strongloop.com',
            'port': 3306,
            'facetName': 'server',
            'database': 'demo',
            'username': 'demo******',
            'password': '**********',
          })
          .end(done);
      });
      it('should create a datasource def', function(done) {
        app.models.DataSourceDefinition.findById('server.test', function(err, def) {
          expect(def).to.exist;
          done();
        });
      });
    });
  });
});
