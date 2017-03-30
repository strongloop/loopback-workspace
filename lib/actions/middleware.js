'use strict';

const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');
const Middleware = require('../datamodel/middleware');
const MiddlewarePhase = require('../datamodel/middleware-phase');

class MiddlewareActions {
  create(phaseName, cb) {
    const workspace = this.getWorkspace();
    const phase = workspace.phases(phaseName);
    phase.add(this);
    this.write(workspace, [], cb);
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    this.read(workspace, cb);
  }
}

mixin(Middleware.prototype, MiddlewareActions.prototype);

class MiddlewarePhaseActions {
  refresh(cb) {
    const workspace = this.getWorkspace();
    this.read(workspace, cb);
  }
  create(phaseName, index, before, cb) {
    const workspace = this.getWorkspace();
    const phaseArr = [phaseName + ':before', phaseName, phaseName + ':after'];
    if (!this.validate(workspace, phaseName))
      return cb(new Error('invalid input phase'));
    index = findCorrectIndex(before, workspace);
    index = lastIndex(index, workspace);
    const middleware = new Middleware({}, 'id', {});
    middleware.write(workspace, phaseArr, function(err) {
      if (err) return cb(err);
      phaseArr.forEach(function(phase) {
        workspace.middlewarePhases.splice(index++, 0, phase);
        let middlewarephase  = new MiddlewarePhase(workspace, phase);
        workspace.add(middlewarephase);
      });
      cb();
    });
  }
  validate(workspace, phaseName) {
    const existingPhase = workspace.middlewarePhases.find(function(value) {
      if (value === phaseName) {
        return true;
      }
      return false;
    });
    if (existingPhase) {
      return false;
    }
    return true;
  }
}

mixin(MiddlewarePhase.prototype, MiddlewarePhaseActions.prototype);

function lastIndex(index, workspace) {
  if (index === -1 || index > workspace.middlewarePhases.length) {
    index = workspace.middlewarePhases.length;
  }
  return index;
}

function findCorrectIndex(before, workspace) {
  let index = -1;
  if (before) {
    workspace.middlewarePhases.find(function(value, i) {
      if (value.startsWith(before)) {
        index = i;
        return true;
      }
      return false;
    });
  }
  return index;
}
