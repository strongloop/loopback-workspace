var asteroid = require('asteroid');
var app = module.exports = asteroid();
var config = require('./config');

(config.transports || []).forEach(function (name) {
  var fn = asteroid[name];

  if (typeof fn === 'function') {
    app.use(fn.call(asteroid));
  } else {
    console.error('Invalid transport: %s', name);
  }
});

// start the server
app.listen(config.port || 3000);
