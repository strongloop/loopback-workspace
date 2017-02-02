'use strict';
const fs = require('fs-extra');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');

exports.givenEmptySandbox = givenEmptySandbox;
exports.givenSandboxDir = givenSandboxDir;

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
