var constants = require('../lib/constants')
  , CONNECTORS = constants.CONNECTORS
  , TYPES = constants.MODULE_TYPES;

var template = {
  description: 'A mobile backend',
  modules: {
    app: {
      type: TYPES.app,
      // models => listModels()
    },
    // data sources
    db: {
      type: TYPES.dataSource,
      connector: CONNECTORS.memory
    },
    mail: {
      type: TYPES.dataSource,
      connector: CONNECTORS.mail
    },
    // 'file-storage': {
    //   type: TYPES.dataSource,
    //   connector: CONNECTORS.file
    // },
    // push: {
    //   type: TYPES.dataSource,
    //   connector: CONNECTORS.push
    // },
    // models
    user: {
      type: TYPES.userModel,
    },
    session: {
      type: TYPES.sessionModel,
    },
    email: {
      type: TYPES.emailModel,
    },
    // notification: {
    //   type: TYPES.notificationModel,
    //   'data-source': 'push'
    // },
    // file: {
    //   type: TYPES.fileModel,
    //   'data-source': 'file'
    // },
    // device: {
    //   type: TYPES.deviceModel,
    //   'data-source': 'db'
    // }
  }
};

template.modules.app.models = listModels(template);

module.exports = template;

function listModels() {
  var modelNames = [];
  var module;
  var isModel;
  
  Object.keys(template.modules).forEach(function (moduleName) {
    module = template.modules[moduleName];
    isModel = !!module['data-source'];
    
    if(isModel) {
      modelNames.push(moduleName);
    }
  });
  
  return modelNames;
}