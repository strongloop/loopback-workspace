var app = require('../app');
var ModelProperty = app.models.ModelProperty;
var ModelDefinition = app.models.ModelDefinition;
var ConfigFile = app.models.ConfigFile;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('ModelProperty', function() {
  beforeEach(givenBasicWorkspace);
  beforeEach(function(done) {
    ModelDefinition.create({
      name: 'user',
      componentName: 'rest'
    }, done);
  });
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
    beforeEach(givenFile('configFile', 'rest/models/user.json'));
    it('should update the correct $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      var type = this.property.type;
      expect(this.property.name).to.equal(this.propertyName);
      expect(properties).to.have.property(this.propertyName);
      expect(properties[this.propertyName]).to.eql({type: type});
    });
  });

  describe('ModelProperty.find(filter, cb)', function (done) {
    it('should contain the property', function (done) {
      ModelProperty.find(function(err, properties) {
        expect(err).to.not.exist;
        expect(toNames(properties)).to.contain(this.propertyName);
        done();
      }.bind(this));
    });
  });

  describe('modelProperty.remove(cb)', function () {
    beforeEach(function(done) {
      this.property.remove(done);
    });
    beforeEach(givenFile('configFile', 'rest/models/user.json'));
    it('should remove from $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      expect(properties).to.not.have.property(this.propertyName);
    });
  });

  describe('model.save()', function () {
    beforeEach(function(done) {
      this.property.type = 'Boolean';
      this.property.save(done);
    });
    beforeEach(givenFile('configFile', 'rest/models/user.json'));
    it('should update the $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      expect(properties[this.propertyName]).to.eql({type: 'Boolean'});
    });
  });

  describe('modelProperty.load()', function() {
    it('should restore model relation', function(done) {
      // every query triggers a reload
      ModelProperty.all(function(err, list) {
        if (err) return done(err);
        expect(list[0].toObject()).to.eql(new ModelProperty({
          name: this.propertyName,
          type: 'String',
          modelName: 'user'
        }).toObject());
        done();
      }.bind(this));
    });
  });
});
