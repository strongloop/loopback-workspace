// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs-extra');
const Facet = require('../').models.Facet;
const expect = require('chai').expect;
const support = require('../test/support');
const givenBasicWorkspace = support.givenBasicWorkspace;
const SANDBOX = support.SANDBOX;

describe('Facet', function() {
  describe('Facet.create(def, cb)', function() {
    this.timeout(15000);

    beforeEach(givenBasicWorkspace);

    it('should use name as the id', function(done) {
      Facet.create({
        name: 'foo',
      }, function(err, def) {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.not.exist;
        expect(def).to.not.have.ownProperty('id');
        expect(def.name).to.equal('foo');
        done();
      });
    });

    it('omits `name` in config.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/config.json');
      expect(content).to.not.have.property('name');
    });

    it('omits `modelsMetadata` in config.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/config.json');
      expect(content).to.not.have.property('modelsMetadata');
    });

    it('omits `facetName` in model-config.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/model-config.json');
      expect(content.User).to.not.have.property('facetName');
    });

    it('omits `facetName` in datasources.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/datasources.json');
      expect(content.db).to.not.have.property('facetName');
    });

    it('omits `configFile` in datasources.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/datasources.json');
      expect(content.db).to.not.have.property('configFile');
    });

    it('includes `_meta.source` in model-config.json', function() {
      const content = fs.readJsonSync(SANDBOX + '/server/model-config.json');
      expect(content).to.have.property('_meta');
      expect(content._meta).to.eql({
        sources: [
          'loopback/common/models',
          'loopback/server/models',
          '../common/models',
          './models',
        ],
        mixins: [
          'loopback/common/mixins',
          'loopback/server/mixins',
          '../common/mixins',
          './mixins',
        ],
      });
    });

    it('saves facet models to correct file', function() {
      const serverModels = fs.readJsonSync(SANDBOX + '/server/model-config.json');
      // eslint-disable-next-line no-unused-expressions
      expect(Object.keys(serverModels), 'server models').to.not.be.empty;
    });

    it('omits json config files in the root of api-server component', function() {
      const files = fs.readdirSync(SANDBOX);
      expect(files).to.not.include.members([
        'config.json',
        'datasources.json',
        'model-config.json']);
    });
  });
});
