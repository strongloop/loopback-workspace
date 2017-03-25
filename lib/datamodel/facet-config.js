'use strict';
const Entity = require('./entity');

/**
 * @class FacetConfig
 *
 * Represents a Facet Configuration in the Workspace graph.
 */
class FacetConfig extends Entity {
  constructor(Workspace, name, data, options) {
    super(Workspace, 'FacetConfig', name, data);
  }
}
module.exports = FacetConfig;
