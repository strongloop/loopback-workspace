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
    beforeEach(function(done) {
      Project.createFromTemplate(SANDBOX, 'mobile', done);
    });

    it.skip('starts', function(done) {
      // This is a smoke test checking that the template generates
      // - a valid definition of models and datasources
      // - a valid configuration of express routes
      var app = require(SANDBOX);
      request(app)
        .get('/explorer/')
        .expect(200)
        .end(done);
    });
  });
})
