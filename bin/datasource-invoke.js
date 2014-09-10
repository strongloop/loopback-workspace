// This script is executed by loopback-workspace in WORKSPACE_DIR
// to run automigrate/autoupdate

var assert = require('assert');

process.once('message', function(msg) {
  invoke(msg, function(err) {
    if(err) {
      if(!err.origin) err.origin = 'invoke';
      return done(err);
    }
    done(null, Array.prototype.slice.call(arguments, 0));
  });

  function done(err, args) {
    try {
      process.send({
        error: err,
        callbackArgs: args
      });
    } catch(e) {
      console.error('failed to send message to parent process');
      console.error(e);
    }

    process.nextTick(function() {
      process.exit();
    });
  }
});

function invoke(msg, cb) {
  var dataSourceName = msg.dataSourceName;
  var methodName = msg.methodName;
  var args = msg.args;
  var cbMsg = {};
  var app;
  var ds;

  assert(dataSourceName, 'dataSourceName is required');
  assert(methodName, 'methodName is required');

  try {
    app = require(msg.dir);
  } catch(e) {
    return error(e, 'app');
  }

  try {
    ds = app.dataSources[dataSourceName];
    if(!ds) {
      throw new Error(dataSourceName + ' is not a valid data source');
    }
  } catch(e) {
    return error(e, 'dataSource');
  }

  try {
    args.push(cb);
    ds[methodName].apply(ds, args);
  } catch (err) {
    return error(e, 'invoke');
  }

  function error(err, origin) {
    err.origin = origin;
    cb(err);
  }
}


Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});
