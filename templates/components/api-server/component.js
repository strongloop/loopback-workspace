/**
 * The api-server component template.
 */
module.exports = function(options) {
  var template = {};

  template.package = {
    "version": "0.0.0",
    "main": "server/server.js",
    "scripts": {
      "pretest": "jshint .",
    },
    "dependencies": {
      "compression": "^1.0.3",
      "errorhandler": "^1.1.1",
      "loopback": "^2.0.0",
      "loopback-boot": "^2.0.0",
      "loopback-datasource-juggler": "^2.7.0",
      "serve-favicon": "^2.0.1"
    },
    "optionalDependencies": {
      "loopback-explorer": "^1.1.0"
    }
  };

  var subclassing = options.subclassingBuiltinModels;
  if (subclassing) {
    template.common = {
      models: [
        {
          name: 'user',
          base: 'User'
        },
        {
          name: 'accessToken',
          base: 'AccessToken'
        },
        {
          name: 'application',
          base: 'Application'
        },
        {
          name: 'acl',
          base: 'ACL'
        },
        {
          name: 'roleMapping',
          base: 'RoleMapping'
        },
        {
          name: 'role',
          base: 'Role'
        }
      ],
      relations: [
        {
          modelId: 'common.user',
          name: 'accessTokens',
          model: 'accessToken',
          type: 'hasMany',
          foreignKey: 'userId'
        },
        {
          modelId: 'common.accessToken',
          name: 'user',
          model: 'user',
          type: 'belongsTo',
          foreignKey: 'userId'
        },
        {
          modelId: 'common.roleMapping',
          name: 'role',
          model: 'role',
          type: 'belongsTo',
          foreignKey: 'roleId'
        },
        {
          modelId: 'common.role',
          name: 'principals',
          model: 'roleMapping',
          type: 'hasMany',
          foreignKey: 'roleId'
        }
      ]
    };
  } else {
    template.common = {};
  }

  template.server = {
    facet: {
      modelsMetadata: {
        sources: ['../common/models', './models']
      }
    },

    config: [
      { name: 'restApiRoot', value: '/api' },
      { name: 'host', value: '0.0.0.0' }, // Listen on all interfaces
      { name: 'port', value: 3000 },
      { name: 'url', value: 'http://localhost:3000/' } // Informational
    ],

    modelConfigs: [
      {
        name: subclassing ? 'user' : 'User',
        dataSource: 'db'
      },
      {
        name: subclassing ? 'accessToken' : 'AccessToken',
        dataSource: 'db',
        public: false
      },
      {
        name: subclassing ? 'acl' : 'ACL',
        dataSource: 'db',
        public: false
      },
      {
        name: subclassing ? 'roleMapping' : 'RoleMapping',
        dataSource: 'db',
        public: false
      },
      {
        name: subclassing ? 'role' : 'Role',
        dataSource: 'db',
        public: false
      },
      {
        name: subclassing ? 'application' : 'Application',
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
  return template;
};
