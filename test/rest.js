var app = require('../app');
var request = require('supertest');

describe('REST API', function () {
  beforeEach(givenEmptySandbox);
  
  describe('/workspaces', function () {
    describe('POST /workspaces', function () {
      beforeEach(function(done) {
        request(app)
          .post('/api/workspaces')
          .set('Content-Type', 'application/json')
          .send({
            templateName: 'api-server',
            name: 'sandbox'
          })
          .expect(204)
          .end(done);
      });
      it('should add a facet from a template', function (done) {
        app.models.Facet.find(function(err, defs) {
          if(err) return done(err);
          var names = toNames(defs);
          expect(names).to.contain('server');
          done();
        });
      });
    });

    /***
     ***   SKIP UNTIL NON ROOT COMPONENT SUPPORT IS ADDED   ***
     ***/

    describe.skip('POST /workspaces/component', function () {
      beforeEach(function(done) {
        request(app)
          .post('/api/workspaces/component')
          .set('Content-Type', 'application/json')
          .send({
            template: 'rest'
          })
          .end(done);
      });
      it('should add a component from a template', function (done) {
        app.models.ComponentDefinition.find(function(err, defs) {
          expect(toNames(defs)).to.contain('rest');
          done();
        });
      });
    });

    describe('POST /workspaces/connectors', function () {
      beforeEach(function(done) {
        this.req = request(app)
          .get('/api/workspaces/connectors')
          .set('Accepts', 'application/json')
          .end(done);
      });
      it('should return a list of connectors', function () {
        var connectors = toNames(this.req.res.body);
        expect(connectors).to.contain('memory');
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
  });
});
