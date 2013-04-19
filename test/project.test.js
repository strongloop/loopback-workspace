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