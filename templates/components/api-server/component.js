/**
 * The api-server component template.
 */

var template = module.exports;

template.package = {
  "version": "0.0.0",
  "main": "server/server.js",
  "dependencies": {
    "compression": "^1.0.3",
    "errorhandler": "^1.1.1",
    "loopback": "~2.0.0-beta5",
    "loopback-boot": "2.0.0-beta2",
    "loopback-datasource-juggler": "~2.0.0-beta2"
  },
  "optionalDependencies": {
    "loopback-explorer": "^1.1.0"
  }
};

template.common = {

};

template.server = {
  facet: {
    modelsMetadata: {
      sources: ['../common/models', './models']
    },
  },

  config: [
    { name: 'restApiRoot', value: '/api' },
    { name: 'host', value: 'localhost' }
  ],

  modelConfigs: [
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
  ],

  datasources: [
    {
      name: 'db',
      connector: 'memory'
    }
  ]
};

// An API server has no client facet
template.client = null;
