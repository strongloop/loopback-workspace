// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();

const templateRegistry = require('../component/template-registry');
templateRegistry.loadTemplates(function(err, status) {
  if (err) throw err;
  console.log(status);
});

boot(app, __dirname, function() {
  app.emit('ready');
});
//add workspace operations to connector
require('../connector/connector.js');

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
