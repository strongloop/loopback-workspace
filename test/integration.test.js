var fs = require('fs');

var temp = require('temp');
var async = require('async');

var Project = require('../').models.Project;

var expect = require('chai').expect;
var request = request = require('supertest');

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

  describe('of type "mobile', function() {
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
        .get('/swagger/resources')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.apis).to.have.length.least(1);
          done();
        });
    });
  });
});
