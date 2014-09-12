var app = require('../app');
var ModelDefinition = app.models.ModelDefinition;
var ModelAccessControl = app.models.ModelAccessControl;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('ModelAccessControl', function() {
  describe('ModelAccessControl.create()', function() {
    beforeEach(givenBasicWorkspace);

    it('should create an accessControl list item', function(done) {
      ModelDefinition.create({
        name: 'TestModel',
        facetName: 'common'
      }, function(err, model) {
        model.accessControls.create({
          principalType: '$role',
          principalId: '$everyone',
          permission: 'ALLOW',
          accessType: '*',
        }, function() {
          var configFile = model.getConfigFile();
          configFile.load(function() {
            expect(configFile.data.acls).to.eql([{
              accessType: '*',
              principalType: '$role',
              principalId: '$everyone',
              permission: 'ALLOW' 
            }]);
            model.accessControls.create({
              principalType: '$role',
              principalId: '$custom',
              permission: 'DENY',
              accessType: '*',
            }, function(err) {
              if(err) return done(err);
              configFile.load(function(err) {
                if(err) return done(err);
                expect(configFile.data.acls).to.exist;
                expect(configFile.data.acls).to.have.length(2);
                expectCorrectOrder(configFile.data.acls);
                // load from disk
                model.accessControls(function(err, acl) {
                  if(err) return done(err);
                  expectCorrectOrder(acl);
                  acl.forEach(function(item, index) {
                    expect(item.index).to.equal(index);
                  });
                  done();
                });
              });

              function expectCorrectOrder(acl) {
                var principalIds = acl.map(function(item) {
                  return item.principalId;
                });
                expect(principalIds).to.eql(['$everyone', '$custom']);
              }
            });
          });
        });
      });
    });
  });

  describe('ModelAccessControl.getAccessTypes(callback)', function() {
    it('Get the available access types.', function() {

    });
  });

  describe('ModelAccessControl.getPermissionTypes(callback)', function() {
    it('Get the available permission types.', function() {

    });
  });

  describe('ModelAccessControl.getPrincipalTypes(callback)', function() {
    it('Get the available principal types.', function() {

    });
  });
});
