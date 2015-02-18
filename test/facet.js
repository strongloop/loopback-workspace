var fs = require('fs-extra');
var Facet = require('../app').models.Facet;

describe('Facet', function () {
  describe('Facet.create(def, cb)', function () {
    beforeEach(givenBasicWorkspace);

    it('should use name as the id', function (done) {
      Facet.create({
        name: 'foo'
      }, function(err, def) {
        expect(err).to.not.exist;
        expect(def).to.not.have.ownProperty('id');
        expect(def.name).to.equal('foo');
        done();
      });
    });

    it('omits `name` in config.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/config.json');
      expect(content).to.not.have.property('name');
    });

    it('omits `modelsMetadata` in config.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/config.json');
      expect(content).to.not.have.property('modelsMetadata');
    });

    it('omits `facetName` in model-config.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/model-config.json');
      expect(content.User).to.not.have.property('facetName');
    });

    it('omits `facetName` in datasources.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/datasources.json');
      expect(content.db).to.not.have.property('facetName');
    });

    it('omits `configFile` in datasources.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/datasources.json');
      expect(content.db).to.not.have.property('configFile');
    });

    it('includes `_meta.source` in model-config.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/server/model-config.json');
      expect(content).to.have.property('_meta');
      expect(content._meta).to.eql({
        sources: [
          'loopback/common/models',
          'loopback/server/models',
          '../common/models',
          './models'
        ]
      });
    });

    it('saves facet models to correct file', function() {
      var serverModels = fs.readJsonFileSync(SANDBOX + '/server/model-config.json');
      expect(Object.keys(serverModels), 'server models').to.not.be.empty;
    });

    it('omits json config files in the root of api-server component', function() {
      var files = fs.readdirSync(SANDBOX);
      expect(files).to.not.include.members([
        'config.json',
        'datasources.json',
        'model-config.json']
      );
    });
  });
});
