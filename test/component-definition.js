var async = require('async');
var app = require('../app');
var ComponentDefinition = app.models.ComponentDefinition;
var ConfigFile = app.models.ConfigFile;

describe('ComponentDefinition', function() {
  describe('componentDefinition.exec(cb)', function () {
    beforeEach(givenBasicWorkspace);
    it('should require() the component main module', function (done) {
      ComponentDefinition.findOne({where: {name: 'rest'}}, function(err, def) {
        expect(err).to.not.exist;
        def.exec(function(err, main) {
          expect(err).to.not.exist;
          expect(main).to.equal(require(SANDBOX + '/rest/rest.js'));
          done();
        });
      });
    });
  });
});
