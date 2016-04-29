// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// This script is executed by loopback-workspace in WORKSPACE_DIR
// to run automigrate/autoupdate

var assert = require('assert');

process.once('message', function(msg) {
  invoke(msg, function(err) {
    if (err) {
      if (!err.origin) err.origin = 'invoke';
      return done(err);
    }
    done(null, Array.prototype.slice.call(arguments, 0));
  });

  function done(err, args) {
    send({
      error: err,
      callbackArgs: args,
    });

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
  var app, ds;

  assert(dataSourceName, 'dataSourceName is required');
  assert(methodName, 'methodName is required');

  try {
    app = require(msg.dir);
  } catch (e) {
    return error(e, 'app');
  }

  try {
    ds = app.dataSources[dataSourceName];
    if (!ds) {
      throw new Error(dataSourceName + ' is not a valid data source');
    }
  } catch (e) {
    return error(e, 'dataSource');
  }

  try {
    args.push(cb);
    ds[methodName].apply(ds, args);
  } catch (e) {
    return error(e, 'invoke');
  }

  function error(err, origin) {
    err.origin = origin;
    cb(err);
  }
}

process.on('uncaughtException', function(err) {
  if (process.send) {
    send({
      error: err,
    });
  } else {
    throw err;
  }
});

function send(msg) {
  if (msg.error) {
    msg.error = toSerializableError(msg.error);
  }

  try {
    process.send(msg);
  } catch (e) {
    console.error('failed to send message to parent process');
    console.error(e);
    process.exit(1);
  }
}

function toSerializableError(err) {
  var alt = {};

  Object.getOwnPropertyNames(err).forEach(function(key) {
    alt[key] = err[key];
  }, this);

  return alt;
}
