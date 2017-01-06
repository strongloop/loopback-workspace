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
    const templates = this.templates;
    const dir = path.resolve(__dirname, '../', 'templates');
    fs.readdir(dir, function(err, items) {
      let index = 0;
      items.forEach(function(fileName) {
        let filePath = path.resolve(dir, fileName);
        fs.readJson(filePath, function(err, jsonData) {
          if (err) return callback(err);
          templates[jsonData.name] = jsonData;
          index++;
          if (index === items.length) {
            return callback(null, 'templates are loaded');
          }
        });
      });
    });
  }
  getTemplate(name) {
    return this.templates[name];
  }
}

const templateRegistry = new TemplateRegistry();

module.exports = templateRegistry;
