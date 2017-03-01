'use strict';
module.exports = function MiddlewareHandler(workspace) {
  workspace.registerEvent('phase.create', workspace.addMiddlewarePhase);
  workspace.registerEvent('phase.refresh', workspace.refreshMiddleware);
  workspace.registerEvent('middleware.create', workspace.addMiddleware);
  workspace.registerEvent('middleware.refresh', workspace.refreshMiddleware);
};
