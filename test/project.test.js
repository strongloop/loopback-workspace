var app = require('../');
var fs = require('fs');
var assert = require('assert');
var expect = require('chai').expect;
var Project = app.models.Project;
var Model = app.models.ModelDefinition;
var DataSource = app.models.DatasourceDefinition;
var path = require('path');
var expect = require('chai').expect;
var FIXTURES = path.join(__dirname, 'fixtures');
var SIMPLE_APP = path.join(FIXTURES, 'simple-project');
var temp = require('temp');
var sandbox = temp.mkdirSync();
var async = require('async');
var loopback = require('loopback');
var ACL = loopback.ACL;
var Role = loopback.Role;

// auto-cleanup temp files / dirs
temp.track();

// clear any persisting data
beforeEach(function (done) {
  async.parallel([
    Project.destroyAll.bind(Project),
    Model.destroyAll.bind(Model),
    DataSource.destroyAll.bind(DataSource)
  ], done);
});

// validate project
function expectValidProjectAtDir(dir, done) {
  Project.isValidProjectDir(dir, function(err, isValid, msg) {
    if(err) return done(err);
    assert(isValid, msg);
    done();
  });
}

function loadProject(done) {
  var test = this;

  Project.loadFromFiles(SIMPLE_APP, function (err, project) {
    if(err) {
      console.log(err);
      done(err);
    }
    test.project = project;
    done();
  });
}

describe('Project', function () {
  describe('Project.loadFromFiles(dir, cb)', function () {
    beforeEach(loadProject);

    it('should load a project from the given directory', function () {
      expect(this.project).to.be.an.instanceOf(Project);
    });
    it('should have app, model, and datasource definitions', function() {
      expect(this.project).to.have.property('app');
      expect(this.project).to.respondTo('models');
      expect(this.project).to.respondTo('dataSources');
    });
    it('should error if the root is not a valid project', function(done) {
      Project.loadFromFiles(process.cwd(), function(err) {
        expect(err).to.be.an.instanceOf(Error);
        done();
      });
    });

    describe('project.models()', function () {
      it('should be a list of ModelDefinitions', function(done) {
        this.project.models(function(err, models) {
          expect(models).to.be.a('array');
          expect(models).to.have.length(1);
          done();
        });
      });
    });
    describe('project.dataSources()', function () {
      it('should be a list of DataSourceDefinitions', function(done) {
        this.project.dataSources(function(err, dataSources) {
          expect(dataSources).to.be.a('array');
          expect(dataSources).to.have.length(1);
          done();
        });
      });
    });
    describe('project.app', function () {
      it('should be an app definition', function() {
        expect(this.project).to.have.a.property('app');
      });
    });
  });
  
  describe('Project.listTemplates()', function() {
    it('should list all the available templates', function () {
      var templates = Project.listTemplates();
      expect(templates).to.be.a('array');
    });
  });

  describe('Project.createFromTemplate(dir, template, cb)', function () {
    it('should create a project in the given dir', function (done) {
      var dir = path.join(sandbox, 'my-project');
      var app = path.join(dir, 'app.json');
      var appJS = path.join(dir, 'app.js');
      var pkg = path.join(dir, 'package.json');
      var models = path.join(dir, 'models.json');
      var dataSources = path.join(dir, 'datasources.json');

      Project.createFromTemplate(dir, 'empty', function(err) {
        if(err) return done(err);

        assertFileExists(app);
        assertFileExists(models);
        assertFileExists(dataSources);
        assertFileExists(appJS);
        assertFileExists(pkg);

        assertJSONFileHas(app, 'port', 3000);
        assertJSONFileHas(app, 'host', '0.0.0.0');
        assertJSONFileHas(app, 'cookieSecret');
        assertJSONFileHas(pkg, 'name', 'my-project');

        assertJSONFileHas(dataSources, 'db.connector', 'memory');
        assertJSONFileHas(models, 'user.options.base', 'User');
        done();
      });
    });
  });
  
  describe('project.saveToFiles(dir, cb)', function () {
    beforeEach(loadProject);
    it('should create and persist all project definitions', function(done) {
      var dir = temp.mkdirSync();

      this.project.saveToFiles(dir, function(err) {
        if(err) return done(err);

        // TODO(ritch) - remove faux file writing to validate project
        fs.writeFileSync(path.join(dir, 'app.js'), '// ...', 'utf8');
        fs.writeFileSync(path.join(dir, 'package.json'), '{}', 'utf8');

        expectValidProjectAtDir(dir, done);
      });
    });

    it('should save models', function (done) {
      var dir = temp.mkdirSync();
      var exModel = {name: 'foo', dataSource: 'db', properties: {name: 'string'}};
      var models = path.join(dir, 'models.json');

      Project.createFromTemplate(dir, 'empty', function(err) {
        if(err) return done(err);

        Project.loadFromFiles(dir, function(err, project) {
          if(err) return done(err);

          project.models.create(exModel, function(err) {
            if(err) return done(err);

            project.saveToFiles(dir, function(err) {
              if(err) return done(err);
              assertJSONFileHas(models, 'user.options.base', 'User');

              expectValidProjectAtDir(dir, function() {
                if(err) return done(err);

                assertJSONFileHas(models, 'foo.dataSource', 'db');
                assertJSONFileHas(models, 'foo.properties.name', 'string');
                done();
              });
            });
          });
        });
      });
    });
  });
  
  describe('project.getDataSourceByName(name, cb)', function () {
    it('should return a data source by name', function (done) {
      var dir = temp.mkdirSync();
      var exampleDataSource = {name: 'foo', connector: 'mongodb', url: 'mongodb://foo:3333/bar'};

      Project.createFromTemplate(dir, 'mobile', function(err) {
        if(err) return done(err);

        Project.loadFromFiles(dir, function(err, project) {
          if(err) return done(err);

          project.getDataSourceByName('mail', function(err, mail) {
            expect(mail).to.have.property('name', 'mail');
            expect(mail).to.have.property('connector', 'mail');
            done();
          });
        });
      });
    });
  });
  
  describe('project.getModelByName(name, cb)', function () {
    it('should return a model by name', function (done) {
      var dir = temp.mkdirSync();
      var exampleDataSource = {name: 'foo', connector: 'mongodb', url: 'mongodb://foo:3333/bar'};

      Project.createFromTemplate(dir, 'mobile', function(err) {
        if(err) return done(err);

        Project.loadFromFiles(dir, function(err, project) {
          if(err) return done(err);

          project.getModelByName('user', function(err, user) {
            expect(user).to.have.property('name', 'user');
            expect(user).to.have.property('dataSource', 'db');
            done();
          });
        });
      });
    });
  });

  describe('permissions', function () {
    beforeEach(function(done) {
      var test = this;
      var dir = test.dir = temp.mkdirSync();

      Project.createFromTemplate(dir, 'mobile', function(err) {
        if(err) return done(err);

        Project.loadFromFiles(dir, function(err, project) {
          if(err) return done(err);

          test.project = project;
          done();
        });
      });
    });

    describe('project.setPermissionDefault(default, cb)', function () {
      it('set the default permission for the app', function () {
        this.project.setPermissionDefault('DENY');
        expect(this.project.app.defaultPermission).to.eql('DENY');
      });
    });

    describe('project.addPermission(modelName, options, cb)', function () {
      it('should add the given permission', function (done) {
        var options = {
          allow: true,
          everyone: true,
          read: true,
          model: 'user'
        };

        var expectedACL = {
          principalType: ACL.ROLE,
          permission: ACL.ALLOW,
          principalId: Role.EVERYONE,
          accessType: ACL.READ
        };

        addAndCheckPermission.call(this, options, expectedACL, done);
      });

      describe('various permission permuations', function () {
        it('deny all access to everyone and all models', function (done) {
          var options = {
            deny: true,
            everyone: true,
            all: true,
            'all-models': true
          };

          var expectedACL = {
            principalType: ACL.ROLE,
            permission: ACL.DENY,
            principalId: Role.EVERYONE,
            accessType: ACL.ALL
          };

          addAndCheckPermission.call(this, options, expectedACL, done);
        });
        it('allow access to owners to execute remove for all models', function (done) {
          var options = {
            allow: true,
            owner: true,
            method: 'remove',
            execute: true,
            'all-models': true
          };

          var expectedACL = {
            principalType: ACL.ROLE,
            permission: ACL.ALLOW,
            principalId: Role.OWNER,
            property: options.method,
            accessType: ACL.EXECUTE
          };

          addAndCheckPermission.call(this, options, expectedACL, done);
        });
      });
    });
  });

  function addAndCheckPermission(options, expectedACL, done) {
    var project = this.project;
    project.addPermission(options, function(err) {
      if(options.model) {
        project.getModelByName(options.model, function(err, model) {
          if(err) return done(err);
          check(model, done);
        });
      } else {
        project.models(function(err, models) {
          if(err) return done(err);
          async.each(models, check.bind(this), done);
        });
      }

      function check(model, cb) {
        if(err) return done(err);

        var acls = model.options.acls;
        var len = acls && acls.length;
        var acl = acls && acls[len - 1];

        expect(len).to.be.gte(1);
        expect(acl).to.exist;
        expect(acl).to.eql(expectedACL);
        cb();
      }
    });
  }

  describe('project.listUseableConnectors(cb)', function () {
    it('should return a list of connectors in package.json');
  });
  
  describe('project.listAvailableConnectors(cb)', function () {
    it('should return a list of connectors available on npm');
  });
  
  describe('project.isValidProjectDir(cb)', function () {
    it('should callback with any errors from any definition');
  });
});
