var template = module.exports;

template.description = 'A project containing a controller, ' +
  'including a single vanilla Message and a single remote method';

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
      name: 'Message',
      dataSource: null,
    },
  ],

  datasources: [],
};
