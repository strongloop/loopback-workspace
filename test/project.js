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

    it('should fail on empty directories', function (done) {
      temp.mkdir('asteroid-project-manager', function (err, root) {
        if (err) {
          return done(err);
        }

        Project.isProject(root, function (valid) {
          expect(valid).to.be.false;
          done();
        });
      });
    });

    it('should fail without package.json');
    it('should fail without app.js');

    it('should succeed otherwise', function (done) {
      Project.isProject(this.tempdir, function (valid) {
        expect(valid).to.be.true;
        done();
      });
    });
  });

  describe('load', function () {
    before(function (done) {
      var self = this;

      self.tempdir = tempPath();
      debug('Temporary directory: %s', self.tempdir);

      Project.create(self.tempdir, {
        name: 'test',
        description: 'This is just a test.'
      }, function (err, project) {
        if (err) {
          return done(err);
        }

        self.project = project;
        self.project.load(done);
      });
    });

    it('should load the name', function () {
      expect(this.project).to.have.property('name', 'test');
    });

    it('should load the description', function () {
      expect(this.project).to.have.property('description', 'This is just a test.');
    });

    it('should fail if the Project is invalid', function () {
      var project = this.project;

      project.remove(function (err) {
        if (err) {
          return done(err);
        }

        project.load(function (err) {
          expect(err).to.exist;
        });
      });
    });
  });

  describe('remove', function () {
    before(function (done) {
      var self = this;

      self.tempdir = tempPath();
      debug('Temporary directory: %s', self.tempdir);

      Project.create(self.tempdir, {
        name: 'test',
        description: 'This is just a test.'
      }, function (err, project) {
        self.project = project;
        done(err);
      });
    });

    it('should remove the directory', function (done) {
      expect(fs.existsSync(this.tempdir)).to.be.true;
      this.project.remove(function (err) {
        if (err) {
          return done(err);
        }

        expect(fs.existsSync(this.tempdir)).to.be.false;
        done();
      });
    });
  });
});
