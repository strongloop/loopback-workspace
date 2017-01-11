// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const templateRegistry = require('../../component/template-registry');

/**
  * Represents a LoopBack Workspace.
  *
  * @class Workspace
  */
module.exports = function(Workspace) {
  Workspace.on('dataSourceAttached', function(eventData) {
    Workspace.create = function(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      const template = templateRegistry.getTemplate(data.templateName);
      if (!template) {
        return cb('Template not found');
      }
      const destinationPath = data.destinationPath;
      const connector = Workspace.getConnector();
      connector.createFromTemplate(template, destinationPath, cb);
    };
    Workspace.loadWorkspace = function(workspaceDir, cb) {
      const connector = Workspace.getConnector();
      connector.loadWorkspace(workspaceDir, cb);
    };
    Workspace.remoteMethod('loadWorkspace', {
      accepts: [{
        arg: 'directory',
        type: 'string',
        http: {source: 'body'}}],
      returns: [{
        arg: 'response',
        type: 'object',
        http: {source: 'res'},
        root: true}],
      http: {
        verb: 'POST',
        path: '/load-workspace',
      },
    });
  });
};
