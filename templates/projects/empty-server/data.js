/**
 * The empty-server component template.
 */
var g = require('strong-globalize')();
var template = module.exports;

template.description = g.f(
  'An empty LoopBack API, without any configured models or datasources'
);

template.supportedLBVersions = ['2.x', '3.x'];

template.package = {
  version: '1.0.0',
  main: 'server/server.js',
  engines: {
    node: '>=6',
  },
  scripts: {
    lint: 'eslint .',
    start: 'node .',
    posttest: 'npm run lint',
  },
  dependencies: {
    compression: '^1.0.3',
    cors: '^2.5.2',
    helmet: '^3.10.0',
    'loopback-boot': '^2.6.5',
    'serve-favicon': '^2.0.1',
    'strong-error-handler': '^3.0.0',
  },
  devDependencies: {
    eslint: '^3.17.1',
    'eslint-config-loopback': '^8.0.0',
  },
  // Avoid NPM warning
  repository: {
    type: '',
    url: '',
  },
  license: 'UNLICENSED',
};

template.common = {};

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
      ],
    },
  },

  config: [
    { name: 'restApiRoot', value: '/api' },
    { name: 'host', value: '0.0.0.0' }, // Listen on all interfaces
    { name: 'port', value: 3000 },
    {
      name: 'remoting',
      value: {
        context: false,
        rest: {
          handleErrors: false,
          normalizeHttpPath: false,
          xml: false,
        },
        json: {
          strict: false,
          limit: '100kb',
        },
        urlencoded: {
          extended: true,
          limit: '100kb',
        },
        cors: false,
      },
    },
  ],

  modelConfigs: [],

  datasources: [],

  componentConfigs: [
    {
      name: 'loopback-component-explorer',
      value: {
        mountPath: '/explorer',
        // Enables 'updateOnly' feature which is to generate operation scoped models in loopback-swagger.
        // This flag is added to component-config.json of LoopBack application which is passed
        // in as opts[] in loopback-swagger.createSwaggerObject()
        generateOperationScopedModels: true,
      },
    },
  ],
};

// An empty server has no client facet
template.client = null;
