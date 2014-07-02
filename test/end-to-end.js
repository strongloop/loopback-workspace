var async = require('async');
var exec = require('child_process').exec;
var extend = require('util')._extend;
var fs = require('fs-extra');
var path = require('path');
var request = require('supertest');
var debug = require('debug')('test:end-to-end');

var Workspace = require('../app.js').models.Workspace;

describe('end-to-end', function() {
  describe('api-server template', function() {
    var app;

    before(resetWorkspace);
    before(givenEmptySandbox);
    before(function createWorkspace(done) {
      givenWorkspaceFromTemplate('api-server', function(err) {
        debug('Created "api-server" in %s', SANDBOX);
        done(err);
      });
    });

    before(function installPackages(done) {
      this.timeout(30000);
      // TODO(bajtos) Implement caching mechanism to speed up subsequent runs
      execNpm(['install'], { cwd: SANDBOX }, done);
    });

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('has authentication enabled', function(done) {
      request(app)
        .get('/api/users')
        .expect(401, done);
    });

    it('can create and login a user', function(done) {
      var credentials = { email: 'test@example.com', password: 'pass' };
      var userId, tokenId;
      async.waterfall([
        function createUser(next) {
          request(app)
            .post('/api/users')
            .send(credentials)
            .expect(200, function(err, res) {
              if (err) return next(err);
              userId = res.body.id;
              debug('created user with id %s', userId);
              next();
            });
        },
        function login(next) {
          request(app)
            .post('/api/users/login')
            .send(credentials)
            .expect(200, function(err, res) {
              if (err) return next(err);
              tokenId = res.body.id;
              debug('obtained access token with id %s', tokenId);
              next();
            });
        },
        function getMyAccount(next) {
          request(app)
            .get('/api/users/' + userId)
            .set('Authorization', tokenId)
            .expect(200, function(err, res) {
              if (err) return next(err);
              debug('my account', res.body);
              expect(res.body.id, 'my user id').to.equal(userId);
              next();
            });
        }
      ], done);
    });
  });
});

function execNpm(args, options, cb) {
  options = options || {};
  options.env = extend(
    {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      USERPROFILE: process.env.USERPROFILE,
    },
    options.env
  );

  var command = 'npm ' + args.map(quoteArg).join(' ');
  debug(command);
  return exec(command, options, function(err, stdout, stderr) {
    debug('--npm install stdout--\n%s\n--npm install stderr--\n%s\n--end--',
      stdout, stderr);
    cb(err, stdout, stderr);
  });
}

function quoteArg(arg) {
  if (!/[ \t]/.test(arg))
    return arg;
  if (!/"/.test(arg))
    return '"' + arg + '"';

  // See strong-cli/lib/command for full implementation of windows quoting
  // https://github.com/strongloop/strong-cli/blob/master/lib/command.js
  // Since we don't expect " in npm arguments, let's skip full quoting
  // and throw an error instead.
  throw new Error('command line arguments must not contain \'"\' character');
}
