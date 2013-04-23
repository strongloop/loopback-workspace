var Project = require('../lib/project');
var path = require('path');
var TEST_PROJECTS = path.join(__dirname, 'support', 'example-projects-dir');
var TEST_PROJECT = path.join(TEST_PROJECTS, 'proj-a');

describe('Project', function(){
  var project;
  
  beforeEach(function(){
    project = new Project({dir: TEST_PROJECT});
  });
  
  describe('.files(fn)', function(){
    // example sync test
    it('should list all files for the project', function(done) {
      project.files(function (err, files) {

        assert(files && typeof files == 'object', 'files should be an array');
        assert(files['asteroid.json'], 'asteroid.json should be included');
        assert(files[path.join('my-model', 'config.json')], 'my-module/config.json should be included');
        
        done(err);
      });
    });
  });

  describe('.filesTree(fn)', function() {
    it('should list all files for the project in a tree', function(done) {
      project.filesTree(function(err, files) {
        if (err) return done(err);

        assert.deepEqual(files, [{
          name: 'my-data-source',
          children: [{
            name: 'config.json'
          }]
        }, {
          name: 'my-model',
          children: [{
            name: 'config.json'
          }]
        }, {
          name: 'asteroid.json',
        }, {
          name: 'package.json'
        }]);

        done();

      });
    });
  });

  describe('.dependencyTree(fn)', function() {
    it('should list object configs by dependency', function(done) {
      project.dependencyTree(function(err, config) {
        if (err) return done(err);

        assert(Array.isArray(config), 'config should be an array');
        assert.equal(config.length, 1, 'config should have one item');
        assert.equal(config[0].name, 'my-model', 'my-model should be the top-level item');
        assert.equal(config[0].dependencyList().length, 1, 'my-model should have one dependency');
        assert.equal(config[0].dependencyList()[0].name, 'my-data-source', 'my-model\'s dependency should be my-data-source');

        done();

      });
    });
  });

  describe('.getConfigByType(fn)', function() {
    it('should list objects by type', function(done) {
      project.getConfigByType(function(err, config) {
        if (err) return done(err);

        assert(Array.isArray(config), 'config should be an array');
        assert.equal(config.length, 2, 'config should list two types');
        assert.equal(config[0].name, 'data-source', "first type should be data-source");
        assert.equal(config[1].name, 'model', "second type should be model");
        assert.equal(config[0].children.length, 1, "data-source should have one object");
        assert.equal(config[0].children[0].name, 'my-data-source', "data-source should have an object called my-data-source");
        assert.equal(config[1].children.length, 1, "model should have one object");
        assert.equal(config[1].children[0].name, 'my-model', "model should have an object called my-model");

        done();
      });
    });
  });
  
  describe('.getConfig(fn)', function(){
    it('should callback with a loaded config', function(done) {
      project.getConfig(function (err, config) {
        var myModel = config.get('my-model');
        
        assert(typeof myModel.module === 'object', 'should have a module constructor');
        assert.equal(myModel.name, 'my-model');
        assert.equal(myModel.module.name, 'model', 'should have name used to load it');
        assert.equal(myModel.module.options.name.type, 'string');
        assert.equal(myModel.module.dependencies()['data-source'].name, 'data-source');
        assert.equal(myModel.baseModule(), 'model');
        assert.deepEqual(myModel.inheritanceChain(), ['model']);
        assert.equal(myModel.dependencies()['data-source'].name, 'my-data-source');
        assert.equal(myModel.options.name, 'myModel');
        assert.equal(myModel.options.properties[0].name, 'foo');
        
        config.children().forEach(function (c) {
          assert(c.name, 'all configs should have a name');
          assert(c.options, 'all configs should have options');
        });
        
        var json = config.toJSON();
        
        assert.equal(json['my-data-source'].inheritanceChain[0], 'data-source');
        
        done();
      });
    });
  });
});