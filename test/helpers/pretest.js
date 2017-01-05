'use strict';
const testSupport = require('./test-support');
const path = require('path');
const sandboxDir = path.resolve(__dirname, '../sandbox/');
const sandboxDir2 = path.resolve(__dirname, '../sandbox2/');

testSupport.givenEmptySandbox(sandboxDir, function(err) {
  if (err) throw err;
});

testSupport.givenEmptySandbox(sandboxDir2, function(err) {
  if (err) throw err;
});
