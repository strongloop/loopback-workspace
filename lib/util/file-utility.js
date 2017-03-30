// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const config = require('../config');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

module.exports = {
  getConfigFiles: getConfigFiles,
  readFile: readFile,
};

function readFile(filePath, cb) {
  fs.readJson(filePath, cb);
}

function getConfigFiles(workspaceDir, cb) {
  const patterns = {};
  const files = config.files;
  const steps = [];
  const result = {};
  Object.keys(files).forEach(function(key) {
    patterns[key] = [];
    let filePattern = files[key];
    patterns[key] = patterns[key].concat(filePattern);
  });

  Object.keys(patterns).forEach(function(key) {
    patterns[key] = patterns[key].concat(patterns[key].map(function(pattern) {
      return path.join('*', pattern);
    }));
  });

  function find(pattern, cb) {
    glob(pattern, {cwd: workspaceDir}, cb);
  }

  Object.keys(patterns).forEach(function(key) {
    steps.push(function(next) {
      async.map(patterns[key], find, function(err, paths) {
        if (err) return cb(err);
        // flatten paths into single list
        let merged = [];
        merged = merged.concat.apply(merged, paths);
        result[key] = merged;
        next();
      });
    });
  });

  async.parallel(steps, function(err) {
    if (err) return cb(err);
    cb(null, result);
  });
}
