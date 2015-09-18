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
    "cors": "^2.5.2",
    "loopback": "^2.22.0",
    "loopback-boot": "^2.6.5",
    "loopback-datasource-juggler": "^2.39.0",
    "loopback-component-explorer": "^2.1.0",
    "serve-favicon": "^2.0.1",
    "serve-static": "^1.10.0"
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
      ],
      mixins: [
        'loopback/common/mixins',
        'loopback/server/mixins',
        '../common/mixins',
        './mixins',
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
        cors: false,
        errorHandler: {
          disableStackTrace: false
        }
    }},
    { name: 'legacyExplorer', value: false }
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
