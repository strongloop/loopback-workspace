var Project = require('../lib/project');
var path = require('path');
var TEST_PROJECTS = path.join(__dirname, 'support', 'example-projects-dir');
var TEST_PROJECT = path.join(TEST_PROJECTS, 'proj-a');

describe('ProjectConfig', function() {
  var project, projectConfig;

  beforeEach(function(done){
    project = new Project({dir: TEST_PROJECT});

    project.getConfig(function(err, config) {
      if (err) return done(err);
      projectConfig = config;
      done();
    });
  });

  describe('.dependents()', function() {
    it('should return a list of objects that depend on the given object', function() {
      var dataSource = projectConfig.get('my-data-source'),
          dependents = dataSource.dependents();

      assert(Array.isArray(dependents), "should have a list");
      assert.equal(dependents.length, 1, "should have only 1 item");
      assert.equal(dependents[0].name, 'my-model', "should be 'my-model'");
    });
  });


});