var app = require('../app');
var ModelProperty = app.models.ModelProperty;
var ConfigFile = app.models.ConfigFile;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('ModelProperty', function() {
  beforeEach(givenEmptyWorkspace);

  beforeEach(function(done) {
    var test = this;
    test.propertyName = 'myProperty';
    var property = {
      name: test.propertyName,
      type: 'String',
      modelName: 'user'
    };
    ModelProperty.create(property, function(err, property) {
      if(err) return done(err);
      test.property = property;
      done();
    });
  });

  describe('ModelProperty.create(property, cb)', function () {
    beforeEach(givenFile('configFile', 'api/models/user.json'));
    it('should update the correct $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      var type = this.property.type;
      expect(this.property.name).to.equal(this.propertyName);
      expect(properties).to.have.property(this.propertyName);
      expect(properties[this.propertyName]).to.eql({type: type});
    });
  });

  describe('modelProperty.remove(cb)', function () {
    beforeEach(function(done) {
      this.property.remove(done);
    });
    beforeEach(givenFile('configFile', 'api/models/user.json'));
    it('should remove from $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      expect(properties).to.not.have.property(this.propertyName);
    });
  });
});
