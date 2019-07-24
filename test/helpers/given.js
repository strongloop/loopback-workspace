// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs-extra');
const path = require('path');
const models = require('../../').models;
const support = require('../support');
const SANDBOX = support.SANDBOX;
const given = module.exports;

/**
 * Configure the server facet to listen on a port that has a different
 * value in each process.
 * @param {function(Error=)} done callback
 */
given.uniqueServerPort = function(done) {
  // Use PID to generate a port number in the range 10k-50k
  // that is unique for each test process
  const port = 10000 + (process.pid % 40000);

  given.facetSetting('server', 'port', port, done);
};

given.facetSetting = function(facetName, settingName, settingValue, done) {
  const FacetSetting = models.FacetSetting;

  const props = {facetName: facetName, name: settingName};
  FacetSetting.findOne({where: props}, function(err, entry) {
    if (err) return done(err);
    if (!entry)
      entry = new FacetSetting(props);

    entry.value = settingValue;
    entry.save(done);
  });
};

given.loopBackInSandboxModules = function() {
  const src = path.resolve(__dirname, '../../node_modules/loopback');
  const dest = path.resolve(SANDBOX, 'node_modules', 'loopback');
  fs.copySync(src, dest);
};

given.modelDefinition = function(facetName, modelDefinition) {
  const dir = path.resolve(SANDBOX, facetName, 'models');
  fs.mkdirpSync(dir);
  const file = path.resolve(dir, modelDefinition.name + '.json');
  fs.writeJsonSync(file, modelDefinition);
};
