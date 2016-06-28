/**
 * The api-server component template.
 */

var template = module.exports;

template.description = 'An empty LoopBack API, without any configured ' +
  'models or datasources';

template.supportedLBVersions = ['2.x', '3.x'];

template.package = {
  'version': '1.0.0',
  'main': 'server/server.js',
  'scripts': {
    'start': 'node .',
    'pretest': 'eslint .',
    'posttest': 'nsp check',
  },
  'dependencies': {
    'compression': '^1.0.3',
    'cors': '^2.5.2',
    'helmet': '^1.3.0',
    'loopback-boot': '^2.6.5',
    'loopback-component-explorer': '^2.4.0',
    'serve-favicon': '^2.0.1',
    'strong-error-handler': '^1.0.1',
  },
  'devDependencies': {
    'eslint': '^2.5.3',
    'nsp': '^2.1.0',
  },
  // Avoid NPM warning
  'repository': {
    'type': '',
    'url': '',
  },
  'license': 'UNLICENSED',
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
      ],
    },
  },

  config: [
    { name: 'restApiRoot', value: '/api' },
    { name: 'host', value: '0.0.0.0' }, // Listen on all interfaces
    { name: 'port', value: 3000 },
    { name: 'remoting', value: {
      context: {
        enableHttpContext: false,
      },
      rest: {
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
      handleErrors: false,
    }},
    { name: 'legacyExplorer', value: false },
  ],

  modelConfigs: [
  ],

  datasources: [
  ],

  componentConfigs: [
    {
      name: 'loopback-component-explorer',
      value: {
        mountPath: '/explorer',
      },
    },
  ],
};

// An empty server has no client facet
template.client = null;
