var fs = require('fs');
var path = require('path');
var debug = require('debug')('loopback:ProjectTests');
var expect = require('chai').expect;
var rimraf = require('rimraf');
var temp = require('temp');
var Project = require('../').Project;
var ModelFactory = require('../factories/model');

function tempPath() {
  var retval = temp.path('loopback-project-manager');
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
      temp.mkdir('loopback-project-manager', function (err, root) {
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

  describe('getModuleConfig', function () {
    before(createProjectWithModel);

    it('should get the module config', function (done) {
      var self = this;

      expect(fs.existsSync(this.tempdir)).to.be.true;
      this.project.getModuleConfig(this.modelName, function (err, config) {
        if (err) {
          return done(err);
        }

        expect(config).to.be.a.object;
        expect(config['data-source']).to.equal(self.options['data-source']);
        done();
      });
    });
  });

  describe('setModuleConfig', function () {
    before(createProjectWithModel);

    it('should set the module config', function (done) {
      var self = this;
      var config = {foo: 'bar'};
      
      expect(fs.existsSync(this.tempdir)).to.be.true;
      this.project.setModuleConfig(this.modelName, config, function (err) {
        if (err) {
          return done(err);
        }

        self.project.getModuleConfig(self.modelName, function(err, gotConfig) {
          if(err) {
            return done(err);
          }
          expect(gotConfig).to.eql(config);
          done();
        });
      });
    });
  });
});

function createProjectWithModel(done) {
  var self = this;
  self.modelName = 'test-model';
  self.options = {
    name: self.modelName,
    'data-source': 'test-data-source'
  };

  self.tempdir = tempPath();

  Project.create(self.tempdir, {
    name: 'test',
    description: 'This is just a test.'
  }, function (err, project) {
    if(err) return done(err);
    self.project = project;

    project.addModule(new ModelFactory, self.modelName, self.options, done);
  });
}
