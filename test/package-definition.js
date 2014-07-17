var fs = require('fs-extra');
var PackageDefinition = require('../app').models.PackageDefinition;

describe('PackageDefinition', function () {
  beforeEach(resetWorkspace);
  beforeEach(givenEmptySandbox);

  describe('PackageDefinition.saveToFs', function() {
    it('omits `id` from package.json', function(done) {
      PackageDefinition.saveToFs(
        {},
        { id: 'test-pkg', name: 'test-pkg' },
        function(err) {
          if (err) return done(err);
          var content = fs.readJsonFileSync(SANDBOX + '/package.json');
          expect(content).to.not.have.property('id');
          done();
        });
    });
  });
});
