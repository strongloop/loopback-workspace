'use strict';

const Facet = require('./datamodel/facet');
const fsUtility = require('./util/file-utility');
const mixin = require('./util/mixin');

module.exports = function FacetHandler(workspace) {
  workspace.registerEvent('facet.create', workspace.addFacet);
};
class FacetAction {
  refresh(cb) {
    const facet = this;
    fsUtility.readModelConfig(facet, cb);
  }
}

mixin(Facet.prototype, FacetAction.prototype);
