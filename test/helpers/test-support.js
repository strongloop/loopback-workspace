'use strict';
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');

const createSandboxDir = function(dir, cb) {
  fs.mkdir(dir, function(err) {
    if (err) return cb(err);
    const modelsDir = path.resolve(dir, 'common', 'models');
    mkdirp(modelsDir, function(err) {
      if (err) return cb(err);
      const result = {};
      result.dir = dir;
      cb(null, result);
    });
  });
};

module.exports.givenEmptySandbox = function(cb) {
  fs.remove(sandboxDir, function(err) {
    if (err) return cb(err);
    createSandboxDir(sandboxDir, cb);
  });
};
