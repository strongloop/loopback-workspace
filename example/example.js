var ProjectManager = require('../');
var Project = require('../lib/project');
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

project.filesTree(log);

/*
  [{
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
  }]
*/

project.dependencyTree(log);

/*
  [
    {
      "name": "my-model",
      "baseModule": "model",
      "dependencies": {
        "data-source": {
          "name": "my-data-source",
          "baseModule": "data-source",
          "dependencies": {},
          ...
        }
      },
      ...
    }
  ]
*/

project.getConfigByType(log);

/*
  [
    {
      "name": "data-source",
      "children": [
        {
          "name": "my-data-source",
          "baseModule": "data-source",
          ...
        }
      ]
    },
    {
      "name": "model",
      "children": [
        {
          "name": "my-model",
          "baseModule": "model",
          ...
        }
      ]
    }
  ]
*/

project.getConfig(function (err, config) {
  log(err, config.toJSON());

  /*
    {
      "data-sources/inventory-db": {
        "name": "inventory-db",
        "module": "oracle-data-source",
        "baseModule": "data-source"
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

  var object = config.get('models/weapon');
  
  // readable
  console.log(object.name); // weapon
  console.log(object.dir); // models/weapon or models\\weapon
  console.log(object.normalDir()); // models/weapon
  console.log(object.module.name); // model
  console.log(object.module.options); // {'name': {type: 'string'}, 'properties': {type: 'array'}}
  console.log(object.module.dependencies); // {'data-source': {data-source-module}}
  console.log(object.baseModule()); // model
  console.log(object.inheritanceChain()); // ["model"]
  console.log(object.dependencies()); // {"data-source": {...config.get('oracle-data-source')...}} 
  console.log(object.dependencyList()); // [{...config.get('oracle-data-source')...}] 
  console.log(object.options.name); // weapon
  console.log(object.options.properties); // [{name: 'product_name', type: 'string'}, ...]

  // writeable
  object.rename('guns', fn);
  object.setOptions({name: 'foo'});
  object.setDependencies({name: 'foo'});
  object.setModule('my-model-module');
  object.save(fn); // fn(err)
});
