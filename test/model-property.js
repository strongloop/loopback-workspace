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
      facetName: 'server'
    }, done);
  });
  beforeEach(function(done) {
    var test = this;
    test.propertyName = 'myProperty';
    var property = {
      name: test.propertyName,
      type: 'String',
      isId: false,
      modelId: 'server.user'
    };
    ModelProperty.create(property, function(err, property) {
      if(err) return done(err);
      test.property = property;
      done();
    });
  });

  describe('ModelProperty.create(property, cb)', function () {
    beforeEach(givenFile('configFile', 'server/models/user.json'));
    it('should update the correct $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      var type = this.property.type;
      expect(this.property.name).to.equal(this.propertyName);
      expect(properties).to.have.property(this.propertyName);
      expect(properties[this.propertyName]).to.eql({type: type, id: false});
    });
    it('should have the correct id', function () {
      expect(this.property.id).to.equal('server.user.myProperty');
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
    beforeEach(givenFile('configFile', 'server/models/user.json'));
    it('should remove from $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      expect(properties).to.not.have.property(this.propertyName);
    });
  });

  describe('model.save()', function () {
    var AN_ORACLE_CONFIG = {
      columnName: 'ID',
      dataType: 'VARCHAR2',
      dataLength: 20,
      nullable: 'N'
    };
    beforeEach(function(done) {
      this.property.type = 'Boolean';
      this.property.isId = true;
      this.property.oracle = AN_ORACLE_CONFIG;
      this.property.save(done);
    });
    beforeEach(givenFile('configFile', 'server/models/user.json'));

    it('should update the $modelName.json file', function () {
      var properties = this.configFile.data.properties;
      expect(properties[this.propertyName]).to.eql({
        type: 'Boolean',
        id: true,
        oracle: AN_ORACLE_CONFIG});
    });
  });

  describe('modelProperty.load()', function() {
    it('should restore model relation', function(done) {
      // every query triggers a reload
      ModelProperty.all(function(err, list) {
        if (err) return done(err);
        var actual = list[0].toObject();
        var expected = new ModelProperty({
          name: this.propertyName,
          type: 'String',
          isId: false,
          facetName: 'server',
          id: 'server.user.myProperty',
          modelId: 'server.user'
        }).toObject();

        expect(actual).to.eql(expected);
        done();
      }.bind(this));
    });
  });

  describe('rename', function () {
    it('should change the id', function (done) {
      ModelProperty.findOne(function(err, prop) {
        expect(err).to.not.exist;
        prop.name = 'renamed';
        prop.save(function(err) {
          expect(err).to.not.exist;
          ModelProperty.find({where: {name: 'renamed'}}, function(err, props) {
            expect(err).to.not.exist;
            var id = 'server.user.renamed';
            expect(props).to.have.length(1);
            expect(props[0]).to.have.property('id', id);
            done();
          });
        });
      });
    });
  });
});
