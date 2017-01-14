'use strict';

module.exports = function(app) {
  const remotes = app.remotes();
  remotes.before('**', function(ctx, next) {
    if (ctx.req.originalUrl) {
      const regEx = /(?:\/api\/Workspace\/)([0-9]*)/;
      const value = ctx.req.originalUrl.match(regEx);
      if (value && value.length > 1) {
        if (ctx.args.options) {
          ctx.args.options.workspaceId = value[1];
        }
      }
    }
    next();
  });
};
