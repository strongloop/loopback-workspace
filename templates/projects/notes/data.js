var template = module.exports;

template.description = 'A project containing a basic working example, ' +
  'including a memory database';

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
