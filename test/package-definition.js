// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const models = require('../').models;
const PackageDefinition = models.PackageDefinition;
const expect = require('chai').expect;
const support = require('../test/support');
const givenBasicWorkspace = support.givenBasicWorkspace;
const givenEmptySandbox = support.givenEmptySandbox;
const resetWorkspace = support.resetWorkspace;
const SANDBOX = support.SANDBOX;

describe('PackageDefinition', function() {
  beforeEach(resetWorkspace);
  beforeEach(givenEmptySandbox);

  describe('PackageDefinition.saveToFs', function() {
    it('omits `id` from package.json', function(done) {
      PackageDefinition.saveToFs(
        {},
        {id: 'test-pkg', name: 'test-pkg'},
        function(err) {
          if (err) return done(err);
          const content = fs.readJsonSync(SANDBOX + '/package.json');
          expect(content).to.not.have.property('id');
          done();
        }
      );
    });
  });

  describe('in project with multiple package.json files', function(done) {
    let MAIN_FILE, MAIN_DATA, SUBPROJECT_FILE, SUBPROJECT_DATA;

    beforeEach(givenBasicWorkspace);

    beforeEach(function prepareScenario() {
      MAIN_FILE = path.resolve(SANDBOX, 'package.json');
      MAIN_DATA = fs.readJsonSync(MAIN_FILE);

      SUBPROJECT_FILE = path.resolve(SANDBOX, 'subproject', 'package.json');
      SUBPROJECT_DATA = {name: 'subproject', version: '1.2.3'};

      fs.mkdirpSync(path.dirname(SUBPROJECT_FILE));
      fs.writeJsonSync(SUBPROJECT_FILE, SUBPROJECT_DATA);
    });

    it('correctly saves package definitions', function(done) {
      // See https://github.com/strongloop/loopback-workspace/issues/181
      models.PackageDefinition.find(function(err, list) {
        if (err) return done;
        async.each(
          list,
          function(it, next) { it.save(next); },
          function(err) {
            if (err) return done(err);
            expect(fs.readJsonSync(MAIN_FILE)).to.eql(MAIN_DATA);
            expect(fs.readJsonSync(SUBPROJECT_FILE)).to.eql(SUBPROJECT_DATA);
            done();
          }
        );
      });
    });

    it('ignores package definitions in nested folders', function(done) {
      // This is a temporary test that should be removed once
      // loopback-workspace supports multiple nested projects
      models.PackageDefinition.find(function(err, list) {
        const packageNames = list.map(function(pkg) { return pkg.name; });
        expect(packageNames).to.eql([MAIN_DATA.name]);
        done();
      });
    });
  });
});
