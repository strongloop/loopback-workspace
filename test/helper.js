// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const helper = require('../lib/helper');
const expect = require('chai').expect;

describe('helper', function() {
  describe('parseLoopBackVersion()', function() {
    it('version range should return valid loopback version', function() {
      const version = helper.parseLoopBackVersion('^2.1.x');
      expect(version).to.equal('^2.1.x');
    });

    it('git url 1.x should return loopback version 1.x', function() {
      const version = helper.parseLoopBackVersion('https://github.com/strongloop/loopback.git#1.x');
      expect(version).to.equal('1.x');
    });

    it('git url 2.x should return loopback version 2.x', function() {
      const version = helper.parseLoopBackVersion('https://github.com/strongloop/loopback.git#2.x');
      expect(version).to.equal('2.x');
    });

    it('git master branch should return master loopback version', function() {
      const version = helper.parseLoopBackVersion('https://github.com/strongloop/loopback.git#master');
      expect(version).to.equal(helper.MASTER_LB_VERSION);
    });

    it('git branch random should return default loopback version', function() {
      const version = helper.parseLoopBackVersion('https://github.com/strongloop/loopback.git#random');
      expect(version).to.equal(helper.DEFAULT_LB_VERSION);
    });

    // normalizeGitUrl defaults to master
    it('random value should return master loopback version', function() {
      const version = helper.parseLoopBackVersion('dummy_value');
      expect(version).to.equal(helper.MASTER_LB_VERSION);
    });

    it('non-string values should return default loopback version', function() {
      const version = helper.parseLoopBackVersion();
      expect(version).to.equal(helper.DEFAULT_LB_VERSION);
    });
  });
});
