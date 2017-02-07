'use strict';

const exec = require('child_process').exec;
const fs = require('fs-extra');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');
const debug = require('debug')('test:util');

exports.givenEmptySandbox = givenEmptySandbox;
exports.givenSandboxDir = givenSandboxDir;
exports.initializePackage = initializePackage;
exports.installSandboxPackages = installSandboxPackages;

function createSandboxDir(dir, cb) {
  fs.mkdirp(dir, function(err) {
    if (err) return cb(err);
    cb();
  });
};

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
