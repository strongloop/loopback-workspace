var ProjectManager = require('../');
var path = require('path');
var TEST_PROJECTS = path.join(__dirname, 'support', 'example-projects-dir');

describe('ProjectManager', function(){
  var projectManager;
  
  beforeEach(function(){
    projectManager = new ProjectManager;
  });
  
  describe('.listProjects', function(){
    // example sync test
    it('should list projects in the provided directory', function(done) {
      projectManager.listProjects(TEST_PROJECTS, function (err, projects) {
        assert(Array.isArray(projects), 'listProjects should callback with an array');
        assert.deepEqual(projects, ['proj-a', 'proj-b'], 'projects names must match the data');
        done(err);
      });
    });
  });
});