// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const fs = require('fs-extra');
const path = require('path');

class TemplateRegistry {
  constructor() {
    this.templates = {};
  }
  loadTemplates(callback) {
    const registry = this;
    const templates = this.templates;
    const baseDir = path.resolve(__dirname, '../', 'templates/config/base');
    const dir = path.resolve(__dirname, '../', 'templates/config');
    const tasks = [];
    const files = [];
    tasks.push(function(next) {
      registry.getTemplateFilePaths(files, baseDir, next);
    });
    tasks.push(function(next) {
      registry.getTemplateFilePaths(files, dir, next);
    });
    tasks.push(function(next) {
      registry.readTemplateFiles(templates, files, next);
    });
    async.series(tasks, callback);
  }
  getTemplate(name) {
    return this.templates[name];
  }
  getTemplateFilePaths(files, dir, next) {
    fs.readdir(dir, function(err, items) {
      if (err) return next(err);
      items.forEach(function(item) {
        const filePath = path.resolve(dir, item);
        if (fs.lstatSync(filePath).isFile()) {
          files.push(filePath);
        }
      });
      next();
    });
  }
  readTemplateFiles(templates, files, callback) {
    let index = 0;
    files.forEach(function(filePath) {
      fs.readJson(filePath, function(err, jsonData) {
        if (err) return callback(err);
        if (jsonData.extends) {
          const parent = templates[jsonData.extends];
          const child = jsonData;
          jsonData = {};
          Object.assign(jsonData, parent, child);
          jsonData.files.parent = parent.files;
        }
        templates[jsonData.name] = jsonData;
        index++;
        if (index === files.length) {
          return callback(null, 'templates are loaded');
        }
      });
    });
  }
}

const templateRegistry = new TemplateRegistry();

module.exports = templateRegistry;
