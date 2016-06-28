var template = module.exports;

template.description = 'A project containing a controller, ' +
  'including a single vanilla Message and a single remote method';

template.supportedLBVersions = ['2.x', '3.x'];

template.inherits = [
  'empty-server',
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
      public: false,
    },
    {
      name: 'Role',
      dataSource: 'db',
      public: false,
    },
    {
      name: 'Message',
      dataSource: null,
    },
  ],

  datasources: [
    {
      name: 'db',
      connector: 'memory',
    },
  ],
};
