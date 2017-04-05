'use strict';

const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');
const Middleware = require('../datamodel/middleware');
const MiddlewarePhase = require('../datamodel/middleware-phase');

class MiddlewareActions {
  create(facetName, phaseName, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.facets(facetName);
    const phase = facet.phases(phaseName);
    phase.add(this);
    this.write(workspace, facet, cb);
  }
  refresh(facetName, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.facets(facetName);
    this.read(facet, cb);
  }
}

mixin(Middleware.prototype, MiddlewareActions.prototype);

class MiddlewarePhaseActions {
  refresh(cb) {
    const workspace = this.getWorkspace();
    this.read(workspace, cb);
  }
  create(facetName, phaseName, index, before, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.facets(facetName);
    if (facet.phases(phaseName))
      return cb(new Error('phase exists already'));
    let beforePhase  = new MiddlewarePhase(workspace, phaseName + ':before');
    let middlewarephase  = new MiddlewarePhase(workspace, phaseName);
    let afterPhase  = new MiddlewarePhase(workspace, phaseName + ':after');
    const middleware = new Middleware({}, 'id', {});
    middleware.write(workspace, facet, function(err) {
      if (err) return cb(err);
      facet.add(beforePhase, index++, before);
      facet.add(middlewarephase, index++, before);
      facet.add(afterPhase, index++, before);
      cb();
    });
  }
}

mixin(MiddlewarePhase.prototype, MiddlewarePhaseActions.prototype);
