module.exports = {
  description: 'A mobile backend',
  models: {
    email: {
      dataSource: 'mail',
      public: false,
      options: {
        base: 'Email'
      }
    },
    user: {
      dataSource: 'db',
      public: true,
      options: {
        base: 'User'
      }
    },
    session: {
      dataSource: 'db',
      public: false,
      options: {
        base: 'Session',
        relations: {
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
