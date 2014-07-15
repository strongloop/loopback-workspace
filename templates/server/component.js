/**
 * The server component template.
 */

var template = module.exports;
var component = template.component = {
  modelsMetadata: {
    sources: ['../models', './models']
  },
  restApiRoot: '/api',
  host: 'localhost'
};

template.package = {
  name: 'server',
  main: 'server.js'
};

template.componentModels = [
  {
    name: 'User',
    dataSource: 'db'
  },
  {
    name: 'AccessToken',
    dataSource: 'db',
    public: false
  },
  {
    name: 'ACL',
    dataSource: 'db',
    public: false
  },
  {
    name: 'RoleMapping',
    dataSource: 'db',
    public: false
  },
  {
    name: 'Role',
    dataSource: 'db',
    public: false
  }
];

template.datasources = [
  {
    name: 'db',
    connector: 'memory'
  }
];
