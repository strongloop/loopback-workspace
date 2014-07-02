var fs = require('fs');

var temp = require('temp');
var async = require('async');

var Project = require('../').models.Project;

var expect = require('chai').expect;
var request = require('supertest');

describe('Generated project', function() {
  beforeEach(givenEmptySandbox);

  describe('of type "empty"', function() {
    beforeEach(function(done) {
      Project.createFromTemplate(SANDBOX, 'empty', done);
    });

    it('starts', function(done) {
      // This is a smoke test checking that the template generates
      // - a valid definition of models and datasources
      // - a valid configuration of express routes
      var app = require(SANDBOX);
      request(app)
        .get('/explorer/')
        .expect(200)
        .end(done);
    });

    it('returns json response for unknown URLs', function(done) {
      var app = require(SANDBOX);
      request(app)
        .get('/unhandled-url')
        .set('Accept', 'application/json')
        .expect(404)
        .expect('Content-Type', /json/)
        .end(done);
    });
  });

  describe('of type "mobile"', function() {
    var app;
    beforeEach(function(done) {
      Project.createFromTemplate(SANDBOX, 'mobile', function(err) {
        if (err) return done(err);
        app = require(SANDBOX);
        done();
      });
    });

    it('starts and servers Swagger HTML', function(done) {
      // This is a smoke test checking that the template generates
      // - a valid definition of models and datasources
      // - a valid configuration of express routes
      request(app)
        .get('/explorer/')
        .expect(200)
        .expect('Content-Type', /text\/html.*/)
        .end(function(err, res) {
          if (err) return done(err);

          expect(res.text).to.contain('StrongLoop API Explorer');
          done();
        });
    });

    it('exposes swagger descriptors', function(done) {
      request(app)
        .get('/api/swagger/resources')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.apis).to.have.length.least(1);
          done();
        });
    });

    it('exposes installations', function(done) {
      request(app)
        .get('/api/installations')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('length', 0);
          done();
        });
    });

    it('can create installations', function(done) {
      request(app)
        .post('/api/installations')
        .send({
          appId: 'MyLoopbackApp',
          appVersion: '1',
          userId: 'raymond',
          deviceToken: '756244503c9f95b49d7ff82120dc193ca1e3a7cb56f60c2ef2a19241e8f33305',
          deviceType: 'ios',
          created: new Date(),
          modified: new Date(),
          status: 'Active'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('id', 1);
          expect(res.body).to.have.property('deviceToken',
            '756244503c9f95b49d7ff82120dc193ca1e3a7cb56f60c2ef2a19241e8f33305');
          request(app)
            .get('/api/installations')
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);
              expect(res.body).to.have.property('length', 1);
              done();
            });
        });
    });

    it('creates ACL models', function() {
      expect(app.models.acl).to.have.property('checkAccess');
      expect(app.models.role).to.have.property('checkAccess');
      expect(app.models.role.relations).to.have.property('principals');
      expect(app.models.role.relations.principals.modelTo).to.equal(app.models.roleMapping);
    });

    it('exposes notifications', function(done) {
      request(app)
        .get('/api/notifications')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('length', 0);
          done();
        });
    });

    it('exposes applications', function(done) {
      request(app)
        .get('/api/applications')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('length', 0);
          done();
        });
    });

    it('creates push data source', function() {
      expect(app.dataSources).to.have.property('push');
      expect(app.dataSources.push.settings).to.deep.equal(
      { defaultForType: 'push',
        connector: 'loopback-component-push',
        debug: false,
        installation: 'installation',
        notification: 'notification',
        application: 'application' });
    });

  });
});
