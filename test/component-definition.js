var fs = require('fs-extra');

describe('ComponentDefinition', function() {
  describe('componentDefinition.saveToFs', function() {
    beforeEach(givenBasicWorkspace);
    it('omits `name` in config.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/rest/config.json');
      expect(content).to.not.have.property('name');
    });

    it('omits `componentName` in models.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/rest/models.json');
      expect(content.User).to.not.have.property('componentName');
    });

    it('omits `componentName` in datasources.json', function() {
      var content = fs.readJsonFileSync(SANDBOX + '/rest/datasources.json');
      expect(content.db).to.not.have.property('componentName');
    });

    it('saves component models to correct file', function() {
      var restModels = fs.readJsonFileSync(SANDBOX + '/rest/models.json');
      var serverModels = fs.readJsonFileSync(SANDBOX + '/server/models.json');
      expect(Object.keys(restModels), 'rest models').to.not.be.empty;
      expect(Object.keys(serverModels), 'server models').to.be.empty;
    });

    it('omits json config files in the root of api-server component', function() {
      var files = fs.readdirSync(SANDBOX);
      expect(files).to.not.include.members([
        'config.json',
        'datasources.json',
        'models.json']
      );
    });
  });
});
