/**
 * The rest component template.
 */

var template = module.exports;
var component = template.component = {};

template.package = {
  "name": "rest",
  "main": "rest.js"
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

template.relations = [
];

template.datasources = [
  {
    name: 'db',
    connector: 'memory'
  }
];
