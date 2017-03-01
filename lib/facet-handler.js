'use strict';

module.exports = function FacetHandler(workspace) {
  workspace.registerHandler('facet', 'create', workspace.addFacet);
};
