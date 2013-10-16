/*!
 * Adds dynamically-updated docs as /explorer
 */
var path = require('path');
var loopback = require('loopback');
var options = require('./module.json');
var STATIC_ROOT = path.join(__dirname, 'explorer');
var explorerUrl = options.url || '/explorer';

process.nextTick(function () {
  var app = require('../app');

  app.docs({ basePath: '/' });
  app.get(explorerUrl, function (req, res, next) {
    if (!/\/$/.test(req.url)) {
      res.redirect(req.url + '/');
    } else {
      next();
    }
  });
  app.use(explorerUrl, loopback.static(STATIC_ROOT));
});

module.exports = {};
