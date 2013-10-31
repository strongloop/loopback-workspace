module.exports = {
  description: 'An empty backend',
  dataSources: {
    db: {
      connector: 'memory'
    }
  },
  models: {},
  app: {
    port: 3000,
    host: '0.0.0.0'
  }
};
