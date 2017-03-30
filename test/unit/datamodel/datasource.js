// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const DataSource = require('../../../lib/datamodel/datasource');
const expect = require('../../helpers/expect');
const Facet = require('../../../lib/datamodel/facet');

describe('Graph: DataSource', function() {
  let facet;
  before(createFacet);

  describe('facet.add()', function() {
    it('adds a datasource node to the facet', function() {
      const ds = new DataSource({}, 'test', {}, {});
      facet.add(ds);
      expect(facet.datasources('test')).to.be.eql(ds);
    });
  });

  function createFacet() {
    facet = new Facet({}, 'temp', {});
  }
});
