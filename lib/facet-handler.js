'use strict';

module.exports = function FacetHandler(workspace) {
  workspace.registerEvent('facet.create', workspace.addFacet);
};
