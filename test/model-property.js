// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var app = require('../');
var given = require('./helpers/given');
var ModelProperty = app.models.ModelProperty;
var ModelDefinition = app.models.ModelDefinition;
var ConfigFile = app.models.ConfigFile;
var TestDataBuilder = require('./helpers/test-data-builder');
var request = require('supertest');

describe('ModelProperty', function() {
  beforeEach(givenBasicWorkspace);
  beforeEach(function(done) {
    this.modelId = 'server.user';
    ModelDefinition.create({
      name: 'user',
      facetName: 'server',
    }, done);
  });
  beforeEach(function(done) {
    var test = this;
    test.propertyName = 'myProperty';
    var property = {
      name: test.propertyName,
      type: 'String',
      isId: false,
      modelId: 'server.user',
    };
    ModelProperty.create(property, function(err, property) {
      if (err) return done(err);
      test.property = property;
      done();
    });
  });

  describe('ModelProperty.create(property, cb)', function() {
    beforeEach(givenFile('configFile', 'server/models/user.json'));
    it('should update the correct $modelName.json file', function() {
      var properties = this.configFile.data.properties;
      var type = this.property.type;
      expect(this.property.name).to.equal(this.propertyName);
      expect(properties).to.have.property(this.propertyName);
      expect(properties[this.propertyName]).to.eql({ type: type, id: false });
    });
    it('should have the correct id', function() {
      expect(this.property.id).to.equal('server.user.myProperty');
    });
  });

  describe('ModelProperty.find(filter, cb)', function(done) {
    it('should contain the property', function(done) {
      ModelProperty.find(function(err, properties) {
        expect(err).to.not.exist;
        expect(toNames(properties)).to.contain(this.propertyName);
        done();
      }.bind(this));
    });
  });

  describe('modelProperty.remove(cb)', function() {
    beforeEach(function(done) {
      this.property.remove(done);
    });
    beforeEach(givenFile('configFile', 'server/models/user.json'));
    it('should remove from $modelName.json file', function() {
      var properties = this.configFile.data.properties;
      expect(properties).to.not.have.property(this.propertyName);
    });
  });

  describe('model.save()', function() {
    var AN_ORACLE_CONFIG = {
      columnName: 'ID',
      dataType: 'VARCHAR2',
      dataLength: 20,
      nullable: 'N',
    };
    beforeEach(function(done) {
      this.property.type = 'Boolean';
      this.property.isId = true;
      this.property.oracle = AN_ORACLE_CONFIG;
      this.property.save(done);
    });
    beforeEach(givenFile('configFile', 'server/models/user.json'));

    it('should update the $modelName.json file', function() {
      var properties = this.configFile.data.properties;
      expect(properties[this.propertyName]).to.eql({
        type: 'Boolean',
        id: true,
        oracle: AN_ORACLE_CONFIG });
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
          modelId: 'server.user',
        }).toObject();

        expect(actual).to.eql(expected);
        done();
      }.bind(this));
    });

    it('handles shorthand notation', function(done) {
      given.modelDefinition('common', {
        name: 'ShortProp',
        properties: { name: 'string' },
      });

      ModelProperty.findOne(
        { where: { id: 'common.ShortProp.name' }},
        function(err, def) {
          if (err) return done(err);
          expect(def.type).to.equal('string');
          done();
        }
      );
    });

    it('handles array shorthand notation', function(done) {
      given.modelDefinition('common', {
        name: 'ShortProp',
        properties: { name: ['string'] },
      });

      ModelProperty.findOne(
        { where: { id: 'common.ShortProp.name' }},
        function(err, def) {
          if (err) return done(err);
          expect(def.type).to.eql(['string']);
          done();
        }
      );
    });

    it('handles properties of built-in loopback models', function(done) {
      given.loopBackInSandboxModules();
      ModelProperty.all(function(err, list) {
        // This is a smoke test,
        // it passes as long as the properties were loaded.
        done(err);
      });
    });
  });

  describe('REST API', function() {
    it('should reject PUT with a name containing a dot', function(done) {
      request(app).put('/api/ModelProperties')
        .send({
          // it's important to include id property,
          // otherwise upsert short-circuits to create
          id: this.modelId + '.dot.name',
          name: 'dot.name',
          type: 'String',
          modelId: this.modelId,
        })
        .expect(422)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.error.details.codes).to.eql({ name: ['format'] });
          done();
        });
    });
  });
});
