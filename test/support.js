var assert = require('assert');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var fstools = require('fs-tools');

assertFileExists = function (file) {
  assert(fs.existsSync(file), file + ' does not exist');
}

assertJSONFileHas = function(file, propertyPath, val) {
  var contents = fs.readFileSync(file, 'utf8');
  var obj = JSON.parse(contents);
  expect(obj).to.have.deep.property(propertyPath, val);
}

SANDBOX = path.resolve(__dirname, 'sandbox/');

givenEmptySandbox = function(cb) {
  fstools.remove(SANDBOX, cb);

  // Remove any cached modules from SANDBOX
  for (var key in require.cache) {
    if (key.slice(0, SANDBOX.length) == SANDBOX)
      delete require.cache[key];
  }
}

// Let express know that we are runing from unit-tests
// This way the default error handler does not log
// errors to STDOUT
process.env.NODE_ENV = 'test';
