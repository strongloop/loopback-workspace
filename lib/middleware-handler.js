'use strict';
module.exports = function MiddlewareHandler(workspace) {
  workspace.registerHandler('Phase', 'create', workspace.addMiddlewarePhase);
  workspace.registerHandler('Phase', 'refresh', workspace.refreshMiddleware);
  workspace.registerHandler('Middleware', 'create', workspace.addMiddleware);
  workspace.registerHandler('Middleware',
    'refresh', workspace.refreshMiddleware);
};
