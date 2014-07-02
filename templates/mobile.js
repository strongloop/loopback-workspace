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
    },
    application: {
      dataSource: 'db',
      public: true,
      options: {
        base: 'Application'
      }
    },
    acl: {
      dataSource: 'db',
      public: false,
      options: {
        base: 'ACL'
      }
    },
    roleMapping: {
      dataSource: 'db',
      public: false,
      options: {
        base: 'RoleMapping'
      }
    },
    role: {
      dataSource: 'db',
      public: false,
      options: {
        base: 'Role',
        relations: {
          principals: {
            type: 'hasMany',
            model: 'roleMapping',
            foreignKey: 'roleId'
          } 
        }
      }
    },
    scope: {
      dataSource: 'db',
      public: false,
      options: {
        base: 'Scope'
      }
    },
    push: {
      dataSource: 'push',
      options: {
        base: 'Push',
        plural: 'push'
      }
    },
    installation: {
      dataSource: 'db',
      public: true,
      options: {
        base: 'Installation'
      }
    },
    notification: {
      dataSource: 'db',
      public: true,
      options: {
        base: 'Notification'
      }
    }
  },
  dataSources: {
    db: {
      defaultForType: 'db',
      connector: 'memory'
    },
    push: {
      defaultForType: 'push',
      connector: 'loopback-component-push',
      installation: 'installation',
      notification: 'notification',
      application: 'application'
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
