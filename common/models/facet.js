// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
/**
  * Add remote methods to loopback model: Facet.
  *
  */
module.exports = function(Facet) {
  Facet.on('dataSourceAttached', function(eventData) {
    Facet.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const id = data.name;
      const connector = Facet.getConnector();
      connector.createFacet(id, data, cb);
    };
  });
};
