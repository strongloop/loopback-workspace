var async = require('async');
var CodeFile = require('../app').models.CodeFile;
var ModelDefinition = require('../app').models.ModelDefinition;
var assert = require('assert');
var testData;

describe('CodeFile', function() {
  beforeEach(givenEmptySandbox);
  beforeEach(function createCodeFile(done) {
    this.path = 'foo/bar.js';
    testData = {hello: 'world'};
    CodeFile.create({
      path: this.path,
      conent: 'console.log(true);'
    }, done);
  });

  describe('codeFile.render(data, cb)', function() {
    it('should apply the data to the template and save as a file', function(done) {
      var codeFile = new CodeFile({
        path: this.path,
        template: 'model'
      });
      var def = new ModelDefinition({name: 'fooBar'});

      codeFile.render({ model: def }, function(err) {
        if(err) return done(err);
        delete codeFile.content;
        codeFile.load(function(err) {
          if(err) return done(err);
          expect(codeFile.content).to.contain('FooBar');
          done();
        });
      });
    });
  });

  describe('codeFile.exists(cb)', function() {
    it('should return true if the file exists', function(done) {
      var codeFile = new CodeFile({
        path: this.path
      });

      codeFile.exists(function(err, exists) {
        expect(exists).to.equal(true);
        done();
      });
    });
  });
});

function assertValidAppConfig(codeFile) {
  assertIsCodeFile(codeFile);
  expect(codeFile.data).to.eql(testData);
}

function assertIsCodeFile(codeFile) {
  assert(codeFile instanceof CodeFile);
}

function codeFilesToPaths(codeFiles) {
  return codeFiles.map(function(codeFile) {
    return codeFile.path;
  });
}

function pathsToCodeFiles(paths) {
  return paths.map(function(path) {
    return new CodeFile({path: path});
  });
}

