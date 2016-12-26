// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const fs = require('fs-extra');
const path = require('path');

class WriteOperations {
  static writeModel(model, cb) {
    const filePath = model.getFilePath();
    const data = model.getDefinition();
    fs.writeJson(filePath, data, function(err) {
      if (err) return cb(err);
      cb(null, data);
    });
  }
}

module.exports = WriteOperations;
