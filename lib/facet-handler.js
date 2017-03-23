'use strict';

const config = require('./config');
const Facet = require('./datamodel/facet');
const fsUtility = require('./util/file-utility');
const mixin = require('./util/mixin');

class FacetAction {
  refresh(cb) {
    const facet = this;
    fsUtility.readModelConfig(facet, cb);
  }
  create(facetDef, cb) {
    const workspace = this.getWorkspace();
    const facet = this;
    if (facetDef) {
      facet.addConfig(facetDef);
    }
    config.defaultModelConfig.forEach(function(modelConfig) {
      facet.addModelConfig(workspace, modelConfig.name, modelConfig);
    });
    fsUtility.writeFacet(workspace, facet, cb);
  }
}

mixin(Facet.prototype, FacetAction.prototype);
