'use strict';
const testSupport = require('./test-support');

testSupport.givenEmptySandbox(function(err) {
  if (err) throw new Error(err);
});
