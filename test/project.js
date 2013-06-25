var fs = require('fs');
var path = require('path');
var debug = require('debug')('asteroid:ProjectTests');
var expect = require('chai').expect;
var rimraf = require('rimraf');
var temp = require('temp');
var Project = require('../').Project;

function tempPath() {
  var retval = temp.path('asteroid-project-manager');
  process.on('exit', function () {
    rimraf.sync(retval);
  });
  return retval;
}

describe('Project', function () {
  describe('create', function () {
    before(function (done) {
      this.tempdir = tempPath();
      debug('Temporary directory: %s', this.tempdir);

      Project.create(this.tempdir, {
        name: 'test',
        description: 'This is just a test.'
      }, done);
    });

    it('should create the root directory', function () {
      expect(fs.existsSync(this.tempdir)).to.be.true;
    });

    it('should create package.json', function () {
      expect(fs.existsSync(path.join(this.tempdir, 'package.json'))).to.be.true;
    });

    it('should create app.js', function () {
      expect(fs.existsSync(path.join(this.tempdir, 'app.js'))).to.be.true;
    });
  });

  describe('isProject', function () {
    before(function (done) {
      this.tempdir = tempPath();
      debug('Temporary directory: %s', this.tempdir);

      Project.create(this.tempdir, {
        name: 'test',
        description: 'This is just a test.'
      }, done);
    });

    it('should fail on empty directories');
    it('should fail without package.json');
    it('should fail without app.js');
    it('should succeed otherwise', function (done) {
      Project.isProject(this.tempdir, function (valid) {
        expect(valid).to.be.true;
        done();
      });
    });
  });
});
