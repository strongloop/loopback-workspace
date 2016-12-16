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
      err.origin = err.origin || 'invoke';
    }
    done(err, Array.prototype.slice.call(arguments, 0));
  });
});

process.on('uncaughtException', done);

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

function done(err, args) {
  if (!process.send) {
    throw err;
  }

  process.send({
    error: toSerializableError(err),
    callbackArgs: args,
  });
}

function toSerializableError(err) {
  if (!err) {
    return null;
  }

  var alt = {};

  Object.getOwnPropertyNames(err).forEach(function(key) {
    alt[key] = err[key];
  }, this);

  return alt;
}
