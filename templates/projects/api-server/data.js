// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The api-server component template.
 */
var g = require('strong-globalize')();
var template = module.exports;

template.description = g.f('A LoopBack API server with local User auth');

template.supportedLBVersions = ['3.x'];

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
  ],

  datasources: [
    {
      name: 'db',
      connector: 'memory',
    },
  ],
};
