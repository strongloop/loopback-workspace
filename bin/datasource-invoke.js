// This script is executed by loopback-workspace in WORKSPACE_DIR
// to run automigrate/autoupdate

var assert = require('assert');

var args = process.argv.slice(2); // skip `node` and script-name
var dataSourceName = args.shift();
var methodName = args.shift();

assert(dataSourceName, 'dataSourceName (arg1) is required');
assert(methodName, 'methodName (arg2) is required');

try {
  console.log('Loading the app.');
  var app = require(process.cwd());

  console.log('Using datasource %j', dataSourceName);
  var ds = app.dataSources[dataSourceName];

  console.log('Invoking %s %j', methodName, args);
  args.push(function callback(err, result) {
    if (err) {
      reportError(err);
      process.exit(1);
    } else {
      console.log('Done', result);
      process.exit(0);
    }
  });

  ds[methodName].apply(ds, args);
} catch (err) {
  reportError(err);
  process.exit(2);
}

function reportError(err) {
  console.error('--datasource-invoke-error--');
  console.error(JSON.stringify({
    message: err.message,
    properties: err,
    stack: err.stack
  }));
}
