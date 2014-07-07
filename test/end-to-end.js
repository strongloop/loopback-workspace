var async = require('async');
var exec = require('child_process').exec;
var extend = require('util')._extend;
var fs = require('fs-extra');
var path = require('path');
var request = require('supertest');
var debug = require('debug')('test:end-to-end');
var ncp = require('ncp');
var workspace = require('../app');
var models = workspace.models;

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

    before(function createCustomModel(done) {
      models.ModelDefinition.create({
        componentName: '.',
        name: 'Custom'
      }, done);
    });

    before(function configureCustomModel(done) {
      models.ComponentModel.create({
        name: 'Custom',
        dataSource: 'db',
        componentName: 'rest'
      }, done);
    });

    before(installSandboxPackages);

    before(function loadApp() {
      app = require(SANDBOX);
    });

    it('provides status on the root url', function(done) {
      request(app)
        .get('/')
        .expect(200, function(err, res) {
          if (err) done(err);
          expect(res.body).to.have.property('uptime');
          done();
        });
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

function installSandboxPackages(cb) {
  if (this && this.timeout) this.timeout(120*1000);

  var pkg = fs.readJsonFileSync(path.resolve(SANDBOX, 'package.json'));
  async.eachSeries(
    Object.keys(pkg.dependencies),
    function install(dep, next) {
      installPackage(dep, pkg.dependencies[dep], next);
    },
    cb);
}

var PKG_CACHE = path.resolve(__dirname, '.pkgcache');

function installPackage(name, version, cb) {
  var quotedVersion = version.replace(/^\^/, 'm-').replace(/^~/, 'p-');
  var cachePath = path.join(PKG_CACHE, name, quotedVersion);
  var dest = path.join(SANDBOX, 'node_modules', name);

  if (fs.existsSync(cachePath)) {
    debug('installing package %s@%s from cache', name, version);
    fs.mkdirsSync(dest);
    ncp(cachePath, dest, cb);
    return;
  }

  debug('installing package %s@%s from npm', name, version);
  execNpm(['install', name + '@' + version], { cwd: SANDBOX }, function(err) {
    if (err) return cb(err);
    fs.mkdirsSync(cachePath);
    ncp(dest, cachePath, cb);
  });
}

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
