/**
 * A generated `AsteroidProjectManager` example...
 *
 * Examples should show a working module api
 * and be used in tests to continously check
 * they function as expected.
 */
 
var ProjectManager = require('../');
var projectManager = ProjectManager.create('.');

projectManager.listProjects('~/' /* optional */ , function (err, projects) {
  console.log(projects);
  /*
    [
      "my-project-a",
      "my-project-b",
      "my-project-c"
    ]
  */
});

var project = new Project({name: 'my-project-a'});

function log(err, result) {
  console.log(err || result);
}

project.files(log);

/*

  {
    "data-sources/inventory-db/config.json": {...fs.stat...},
    ...
  }

*/

project.getConfig(function (err, config) {
  log(err, config.toJSON());

  /*
    {
      "data-sources/inventory-db": {
        "name": "inventory-db",
        "module": "oracle-data-source",
        "base-module": "data-source"
      }
    }
  */
});


project.getConfig(function (err, config) {
  if(err) throw err;
  
  config.getInheritenceChain('data-sources/inventory-db', log);

  /*
    [
      "oracle-data-source",
      "data-source"
    ]
  */
});

project.getConfig(function (err, config) {

  var object = config.get('data-sources/inventory-db');
  
  console.log(object.name); // inventory-db
  console.log(object.module); // oracle-data-source
  console.log(object.baseModule()); // data-source
  console.log(object.inheritenceChain()); // ["oracle-data-source", "data-source"]
});
