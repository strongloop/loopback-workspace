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
        base: 'User',
        relations: {
          accessTokens: {
            model: 'accessToken',
            type: 'hasMany',
            foreignKey: 'userId'
          }
        }
      }
    },
    accessToken: {
      dataSource: 'db',
      public: true,
      options: {
        base: 'AccessToken'
      }
    }
  },
  dataSources: {
    db: {
      defaultForType: 'db',
      connector: 'memory'
    },
    mail: {
      defaultForType: 'mail',
      connector: 'mail'
    }
  },
  app: {
    port: 3000,
    host: '0.0.0.0'
  }
};
