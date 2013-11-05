module.exports = {
  description: 'A mobile backend',
  models: {
    email: {
      dataSource: 'mail',
      public: false,
      options: {
        extends: 'Email'
      }
    },
    user: {
      dataSource: 'db',
      public: true,
      options: {
        extends: 'User'
      }
    },
    session: {
      dataSource: 'db',
      public: false,
      options: {
        extends: 'Session',
        relationships: {
          session: {
            model: 'user',
            type: 'belongsTo',
            foreignKey: 'uid'
          }
        }
      }
    }
  },
  dataSources: {
    db: {
      connector: 'memory'
    },
    mail: {
      connector: 'mail'
    }
  },
  app: {
    port: 3000,
    host: '0.0.0.0'
  }
};
