'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');
const debug = require('debug')('test:util');
const app = require('../..');
const Workspace = app.models.Workspace;

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

function givenBasicWorkspace(typeOfTest, templateName, next) {
  const destinationPath =
    givenSandboxDir(typeOfTest, templateName);
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

function givenSandboxDir(typeOfTest, templateName) {
  return path.join(sandboxDir, typeOfTest, templateName);
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
