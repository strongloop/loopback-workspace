'use strict';

const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');
const Middleware = require('../datamodel/middleware');

class MiddlewareActions {
  refresh(facetName, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.facets(facetName);
    this.read(facet, cb);
  }
  create(workspace, facet, cb) {
    this.write(workspace, facet, cb);
  }
}

mixin(Middleware.prototype, MiddlewareActions.prototype);
