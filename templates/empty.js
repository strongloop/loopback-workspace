var constants = require('../lib/constants')
  , CONNECTORS = constants.CONNECTORS
  , TYPES = constants.MODULE_TYPES;

module.exports = {
  description: 'An empty backend',
  modules: {
    db: {
      type: TYPES.dataSource,
      connector: CONNECTORS.memory
    },
    app: {
      type: TYPES.app
    }
  }
};