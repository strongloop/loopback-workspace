/**
 * The rest component template.
 */

var template = module.exports;
var component = template.component = {
  name: 'rest',
  type: 'service' // placeholder
};

template.package = {
  "name": "rest",
  "main": "rest.js"
};

template.componentModels = [
  {
    name: 'user',
    dataSource: 'db'
  },
  {
    name: 'user',
    dataSource: 'db'
  },
  {
    name: 'acl'
    dataSource: 'db'
  },
  {
    name: 'roleMapping',
    dataSource: 'db'
  },
  {
    name: 'role',
    dataSource: 'db'
  }
];

template.relations = [
  {
    fromModel: 'user',
    model: 'access-token',
    type: 'hasMany',
    foreignKey: 'userId'
  },
  {
    fromModel: 'role',
    type: 'hasMany',
    model: 'roleMapping',
    foreignKey: 'roleId'
  }
];

template.datasources = [
  {
    name: 'db',
    defaultForType: 'db',
    connector: 'memory'
  },
  {
    name: 'mail',
    defaultForType: 'mail',
    connector: 'mail'
  }
];
