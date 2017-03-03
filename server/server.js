// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
const boot = require('loopback-boot');
const loopback = require('loopback');
const templateRegistry = require('../lib/template-registry');

const app = loopback();
module.exports = app;
module.exports.WorkspaceManager = require('../lib/workspace-manager');

templateRegistry.loadTemplates(function(err, status) {
  if (err) throw err;
  app.emit('templates-loaded');
});

boot(app, __dirname, function() {
  app.emit('ready');
});
// add workspace operations to connector
require('./connector');

app.start = function() {
  return app.listen(function() {
    var baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
  });
};

if (require.main === module) {
  app.start();
}

// API explorer
require('loopback-component-explorer')(app);
