/**
 * The empty template. Only contains the basic structure and a simple API server.
 */

var template = module.exports;

template.packages = [];

template.components = [
  {
    name: '.', // the root component of the workspace
    dev: {
      port: 3000,
      host: 'localhost',
    },
    staging: {
      port: 80,
      host: 'my.staging.com',
      ssl: {
        key: 'ssl-key.pem',
        cert: 'ssl-cert.pem'
      }
    },
    production: {
      port: 80,
      host: 'my.production.com',
      ssl: {
        key: 'ssl-key.pem',
        cert: 'ssl-cert.pem'
      }
    }
  },
  {
    name: 'api'
  }
];

template.models = [
  {
    componentName: 'api',
    name: 'user',
    plural: 'users',
    url: '/users',
    dataSource: 'db',
    public: true,
    base: 'User'
  },
  {
    componentName: 'api',
    name: 'access-token',
    plural: 'access-tokens',
    url: '/access-tokens',
    dataSource: 'db',
    public: false,
    options: {
      base: 'AccessToken'
    }
  }
];

template.relations = [
  {
    fromModel: 'user',
    model: 'access-token',
    type: 'hasMany',
    foreignKey: 'userId'
  }
];

template.datasources = [
  {
    componentName: 'api',
    name: 'db',
    defaultForType: 'db',
    connector: 'memory'
  },
  {
    componentName: 'api',
    name: 'mail',
    defaultForType: 'mail',
    connector: 'mail'
  }
];
