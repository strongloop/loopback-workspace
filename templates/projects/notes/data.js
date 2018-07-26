/**
 * The notes component template.
 */
var g = require('strong-globalize')();
var template = module.exports;

template.description = g.f(
  'A project containing a basic working example, including a memory database'
);

template.supportedLBVersions = ['2.x', '3.x'];

template.inherits = ['empty-server'];

template.package = {};

template.common = {};

template.server = {
  facet: {},

  config: [],

  modelConfigs: [
    {
      name: 'User',
      dataSource: 'db',
    },
    {
      name: 'AccessToken',
      dataSource: 'db',
      public: false,
    },
    {
      name: 'ACL',
      dataSource: 'db',
      public: false,
    },
    {
      name: 'RoleMapping',
      dataSource: 'db',
      options: {
        strictObjectIDCoercion: true,
      },
      public: false,
    },
    {
      name: 'Role',
      dataSource: 'db',
      public: false,
    },
    {
      name: 'Note',
      dataSource: 'db',
    },
  ],

  datasources: [
    {
      name: 'db',
      connector: 'memory',
    },
  ],
};
