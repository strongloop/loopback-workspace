/**
 * The api-server component template.
 */

var template = module.exports;
var component = template.component = {
  name: '.',
  type: 'application', // placeholder
  restApiRoot: '/api',
  components: ['rest', 'server']
};

template.package = {
  "version": "0.0.0",
  "main": "server/server.js",
  "dependencies": {
    "loopback": "^2.0.0",
    "loopback-datasource-juggler": "^2.0.0"
  },
  "optionalDependencies": {
    "loopback-explorer": "^1.1.0"
  }
};

template.models = [
  {
    name: 'user',
    plural: 'users',
    dataSource: 'db',
    public: true,
    base: 'User'
  },
  {
    name: 'acl'
    dataSource: 'db',
    public: false,
    base: 'ACL'
  },
  {
    name: 'roleMapping',
    dataSource: 'db',
    public: false,
    base: 'RoleMapping'
  },
  {
    name: 'role',
    dataSource: 'db',
    public: false,
    base: 'Role'
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
