var app = require('../');
var Project = app.models.Project;
var Datasource = app.models.DatasourceDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('DatasourceDefinition', function() {
  it('validates `name` uniqueness within the project only', function(done) {
    var ref = TestDataBuilder.ref;
    new TestDataBuilder()
      .define('project1', Project, {
        name: 'project1'
      })
      .define('project2', Project, {
        name: 'project2'
      })
      .define('project1datasource', Datasource, {
        name: 'dsname',
        projectId: ref('project1.id')
      })
      .define('project2datasource', Datasource, {
        name: ref('project1datasource.name'),
        projectId: ref('project2.id')
      })
      .buildTo({}, function(err) {
        if (err && err.name === 'ValidationError') {
          err.message += '\nDetails: ' +
            JSON.stringify(err.details.messages, null, 2);
        }
        // The test passes when no error was reported.
        done(err);
      });
  });
});
