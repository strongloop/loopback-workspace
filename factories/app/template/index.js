/*!
 * The Application module is responsible for attaching other modules to an Loopback application.
 */
var loopback = require('loopback');
var config = require('./config');
var app = loopback();
var transports = config.transports || [];

/**
 * If we've defined transports for remoting, attach those to the Application.
 */
transports.forEach(function (name) {
  var fn = loopback[name];

  if (typeof fn === 'function') {
    app.use(fn.call(loopback));
  } else {
    console.error('Invalid transport: %s', name);
  }
});

/**
 * Start the server.
 */
app.listen(config.port || 3000);

/*!
 * Export `app` for use in other modules.
 */
module.exports = app;
