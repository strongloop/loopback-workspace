// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const FacetClass = require('../../lib/datamodel/facet');
const WorkspaceManager = require('../../lib/workspace-manager.js');

/**
  * Add remote methods to loopback model: Facet.
  *
  */
module.exports = function(Facet) {
  Facet.on('dataSourceAttached', function(eventData) {
    Facet.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }
      const id = data.name;
      delete data.name;
      const workspace = WorkspaceManager.getWorkspace(options.workspaceId);
      const facet = new FacetClass(workspace, id, data);
      facet.execute(facet.create.bind(facet, data), cb);
    };
  });
};
