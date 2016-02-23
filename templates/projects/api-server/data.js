/**
 * The api-server component template.
 */

var template = module.exports;

template.inherits = [
  'empty-server'
];

template.package = {
};

template.common = {
};

template.server = {
  facet: {
  },

  config: [
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
