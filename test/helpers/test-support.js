'use strict';

const app = require('../..');
const config = require('./config.json');
const debug = require('debug')('test:util');
const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');
const Workspace = app.models.Workspace;

exports.configureMySQLDataSource = configureMySQLDataSource;
exports.givenEmptySandbox = givenEmptySandbox;
exports.givenSandboxDir = givenSandboxDir;
exports.initializePackage = initializePackage;
exports.installSandboxPackages = installSandboxPackages;
exports.givenBasicWorkspace = givenBasicWorkspace;

function createSandboxDir(dir, cb) {
  fs.mkdirp(dir, function(err) {
    if (err) return cb(err);
    cb();
  });
};

function givenBasicWorkspace(templateName, next) {
  const destinationPath =
    givenSandboxDir(templateName);
  givenEmptySandbox(destinationPath, function(err) {
    if (err) return next(err);
    const data = {
      templateName: 'empty-server',
      destinationPath: destinationPath,
    };
    Workspace.create(data, {}, next);
  });
}

function givenEmptySandbox(sandboxDir, cb) {
  fs.remove(sandboxDir, function(err) {
    if (err) return cb(err);
    createSandboxDir(sandboxDir, cb);
  });
}

function givenSandboxDir(templateName) {
  return path.join(sandboxDir, templateName);
}

function initializePackage(dir, cb) {
  fs.mkdir(path.join(dir, 'node_modules'), cb);
}

function installSandboxPackages(dir, cb) {
  initializePackage(dir, function(err) {
    if (err) return cb(err);
    localInstall(dir, cb);
  });
}

function localInstall(cwd, cb) {
  var options = {
    cwd: cwd,
  };
  var script = 'npm install';
  return exec(script, options, function(err) {
    cb(err);
  });
}

function configureMySQLDataSource(
testsuite,
DataSourceDefinition,
templateName,
testName,
data,
cb) {
  testsuite.findOne(
    DataSourceDefinition,
    data,
    templateName,
    testName,
    function(err, ds) {
      if (err) return cb(err);
      ds.connector = 'mysql';
      ds.facetName = 'server';
      ds.database = config.DATABASE;
      ds.user = config.USER;
      ds.password = config.PASSWORD;
      ds.save(testsuite.getContext(templateName), cb);
    });
}
