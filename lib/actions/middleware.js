'use strict';

const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');
const Middleware = require('../datamodel/middleware');
const MiddlewarePhase = require('../datamodel/middleware-phase');

class MiddlewareActions {
  create(phaseName, cb) {
    const workspace = this.getWorkspace();
    const phase = workspace.getMiddlewarePhase(phaseName);
    phase.add(this);
    fsUtility.writeMiddleware(workspace, cb);
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    fsUtility.readMiddleware(workspace, cb);
  }
}

mixin(Middleware.prototype, MiddlewareActions.prototype);

class MiddlewarePhaseActions {
  refresh(cb) {
    const workspace = this.getWorkspace();
    fsUtility.readMiddleware(workspace, cb);
  }
  create(phaseName, index, before, cb) {
    const workspace = this.getWorkspace();
    const phaseArr = [phaseName + ':before', phaseName, phaseName + ':after'];
    if (this.validate(workspace, phaseName, cb)) {
      index = correctIndex(index, workspace);
      if (before) {
        workspace.middlewarePhases.find(function(value, i) {
          if (value.startsWith(before)) {
            index = i;
            return true;
          }
          return false;
        });
      }
      if (index && index < workspace.middlewarePhases.length) {
        phaseArr.forEach(function(phase) {
          workspace.middlewarePhases.splice(index++, 0, phase);
          new MiddlewarePhase(workspace, phase);
        }, this);
        fsUtility.writeMiddleware(workspace, cb);
        return;
      }
      phaseArr.forEach(function(phase) {
        workspace.middlewarePhases.push(phase);
        new MiddlewarePhase(workspace, phase);
      }, this);
      fsUtility.writeMiddleware(workspace, cb);
    }
  }
  validate(workspace, phaseName, cb) {
    const existingPhase = workspace.middlewarePhases.find(function(value) {
      if (value === phaseName) {
        return true;
      }
      return false;
    });
    if (existingPhase) {
      cb(new Error('phase exists already'));
      return false;
    }
    return true;
  }
}

mixin(MiddlewarePhase.prototype, MiddlewarePhaseActions.prototype);

function correctIndex(index, workspace) {
  if (index === -1 || index > workspace.middlewarePhases.length) {
    index = workspace.middlewarePhases.length;
  }
  return index;
}
