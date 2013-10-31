var assert = require('assert');
var fs = require('fs');
var expect = require('chai').expect;

assertFileExists = function (file) {
  assert(fs.existsSync(file), file + ' does not exist');
}

assertJSONFileHas = function(file, propertyPath, val) {
  var contents = fs.readFileSync(file, 'utf8');
  var obj = JSON.parse(contents);
  expect(obj).to.have.deep.property(propertyPath, val);
}
