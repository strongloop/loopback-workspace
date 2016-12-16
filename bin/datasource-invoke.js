// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// This script is executed by loopback-workspace in WORKSPACE_DIR
// to run automigrate/autoupdate

var g = require('strong-globalize')();
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
    }, function() {
      // XXX better to do this when the send has completed, which may be the
      // actual source of your bug.
      //
      // But even better would be to not do this here. kill your child in your
      // parent process after its received its message (assuming that you don't
      // control the invoked methods... they shouldn't have side effects, and
      // node should exit by itself, but if you don't trust them, best to kill
      // from the parent where it cannot be stopped).
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

  assert(dataSourceName, g.f('dataSourceName is required'));
  assert(methodName, g.f('methodName is required'));

  try {
    app = require(msg.dir);
  } catch (e) {
    return error(e, 'app');
  }

  try {
    ds = app.dataSources[dataSourceName];
    if (!ds) {
      throw new Error(g.f('%s is not a valid data source', dataSourceName));
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

// XXX(sam) don't do this, its unnecessary and dangerous, its not guaranteed
// by node that this is valid, and the default behaviour of writing to stderr
// is perfect for you, since you already collect the stderr in the parent.
process.on('uncaughtException', function(err) {
  // XXX(sam) the only way this is reachable is if globalize fails to
  // initialize, AND this process doesn't have an IPC channel... delete all this
  // code along with the uncaught exception handler.
  if (process.send) {
    send({
      error: err,
    });
  } else {
    // XXX(sam) loses the stack trace :-(
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
    // XXX(sam) get rid of this, too, the exception will already kill node,
    // writing to stderr, and hit your top level stderr collector. There are way
    // to many methods of sending errors to the parent in this code. Its un-unit
    // testable, and unpredictable.
    g.error('failed to send message to parent process');
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
