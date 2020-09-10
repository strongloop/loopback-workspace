// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const SG = require('strong-globalize');
SG.SetRootDir(path.join(__dirname, '..'));
const g = SG();

const loopback = require('loopback');
const methodOverride = require('method-override');
const app = module.exports = loopback();
const boot = require('loopback-boot');
const cookieParser = require('cookie-parser');
const debug = require('debug')('loopback:workspace:server');
const errorHandler = require('strong-error-handler');

/*
 * 1. Configure LoopBack models and datasources
 *
 * Read more at http://apidocs.strongloop.com/loopback#appbootoptions
 */

boot(app, __dirname);

// file persistence
require('./connector');

app.emit('ready');

/*
 * 2. Configure request preprocessing
 *
 *  LoopBack support all express-compatible middleware.
 */

app.use(loopback.favicon());
app.use(cookieParser(app.get('cookieSecret')));
app.use(methodOverride());

/*
 * EXTENSION POINT
 * Add your custom request-preprocessing middleware here.
 * Example:
 *   app.use(loopback.limit('5.5mb'))
 */

/*
 * 3. Setup request handlers.
 */

// LoopBack REST interface
app.use(app.get('restApiRoot'), loopback.rest());

// To prevent the snyk warning about swagger-ui@2.x, the explorer component
// is moved from dependencies to devDependencies.
// Here we try to mount the explorer component in case it's installed.

let hasExplorer;
try {
  require.resolve('loopback-component-explorer');
  hasExplorer = true;
} catch (err) {
  debug(
    'loopback-workspace runs without API Explorer enabled due to %s. \n' +
    'To install it, run `npm i loopback-component-explorer`.',
    err.stack || err,
  );
  hasExplorer = false;
}

if (hasExplorer) {
  require('loopback-component-explorer')(app);
  app.once('started', function(baseUrl) {
    g.log('Browse your REST API at %s%s', baseUrl, '/explorer');
  });
}

/*
 * EXTENSION POINT
 * Add your custom request-handling middleware here.
 * Example:
 *   app.use(function(req, resp, next) {
 *     if (req.url == '/status') {
 *       // send status response
 *     } else {
 *       next();
 *     }
 *   });
 */

// The static file server should come after all other routes
// Every request that goes through the static middleware hits
// the file system to check if a file exists.
app.use(loopback.static(path.join(__dirname, 'public')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

/*
 * 4. Setup error handling strategy
 */

/*
 * EXTENSION POINT
 * Add your custom error reporting middleware here
 * Example:
 *   app.use(function(err, req, resp, next) {
 *     console.log(req.url, ' failed: ', err.stack);
 *     next(err);
 *   });
 */

// The ultimate error handler.
app.use(errorHandler());

/*
 * 5. Add a basic application status route at the root `/`.
 *
 * (remove this to handle `/` on your own)
 */

app.get('/', loopback.status());

/*
 * 6. Enable access control and token based authentication.
 */

const swaggerRemote = app.remotes().exports.swagger;
if (swaggerRemote) {
  swaggerRemote.requireToken = false;
}

/*
 * 7. Optionally start the server
 *
 * (only if this module is the main module)
 */

app.start = function() {
  return app.listen(function() {
    const baseUrl = 'http://' + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    g.log('LoopBack server listening @ %s%s', baseUrl, '/');
  });
};

if (require.main === module) {
  app.start();
}
