/**
 * The api-server component template.
 */

var template = module.exports;

template.package = {
  "version": "1.0.0",
  "main": "server/server.js",
  "scripts": {
    "pretest": "jshint .",
  },
  "dependencies": {
    "compression": "^1.0.3",
    "errorhandler": "^1.1.1",
    "loopback": "^2.8.0",
    "loopback-boot": "^2.4.0",
    "loopback-datasource-juggler": "^2.7.0",
    "serve-favicon": "^2.0.1"
  },
  "optionalDependencies": {
    "loopback-explorer": "^1.1.0"
  },
  "devDependencies": {
    "jshint": "^2.5.6"
  },
  // Avoid NPM warning
  "repository": {
    "type": "",
    "url": ""
  }
};

template.common = {

};

template.server = {
  facet: {
    modelsMetadata: {
      sources: [
        'loopback/common/models',
        'loopback/server/models',
        '../common/models',
        './models',
      ]
    }
  },

  config: [
    { name: 'restApiRoot', value: '/api' },
    { name: 'host', value: '0.0.0.0' }, // Listen on all interfaces
    { name: 'port', value: 3000 },
    { name: 'remoting', value: {
        context: {
          enableHttpContext: false
        },
        rest: {
          normalizeHttpPath: false,
          xml: false
        },
        json: {
          strict: false,
          limit: '100kb'
        },
        urlencoded: {
          extended: true,
          limit: '100kb'
        },
        cors: {
          origin: true,
          credentials: true
        },
        errorHandler: {
          disableStackTrace: false
        }
    }}
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
