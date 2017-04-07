'use strict';
const Entity = require('./entity');
const fs = require('fs-extra');

/**
 * @class FacetConfig
 *
 * Represents a Facet Configuration in the Workspace graph.
 */
class FacetConfig extends Entity {
  constructor(Workspace, name, data, options) {
    super(Workspace, 'FacetConfig', name, data);
  }

  write(facet, cb) {
    const facetConfigFile = facet.getConfigPath();
    const facetConfig = facet.facetconfig().map({json: true});
    fs.writeJson(facetConfigFile, facetConfig, cb);
  }
}

module.exports = FacetConfig;
