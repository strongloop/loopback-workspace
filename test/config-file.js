// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const async = require('async');
const FACET_CONFIG_JSON = 'server/config.json';
const ConfigFile = require('../').models.ConfigFile;
const assert = require('assert');
const expect = require('chai').expect;
const support = require('../test/support');

let testData;

describe('ConfigFile', function() {
  beforeEach(support.resetWorkspace);
  beforeEach(support.givenEmptySandbox);
  beforeEach(function createConfigFile(done) {
    testData = {hello: 'world'};
    ConfigFile.create({
      path: FACET_CONFIG_JSON,
      data: testData,
    }, done);
  });

  describe('ConfigFile.loadFromPath(path, cb)', function() {
    it('should load a config file at the given workspace relative path', function(done) {
      ConfigFile.loadFromPath(FACET_CONFIG_JSON, function(err, configFile) {
        assertValidAppConfig(configFile);
        done();
      });
    });
  });

  describe('configFile.load(cb)', function() {
    it('should load the configFile data', function(done) {
      const configFile = new ConfigFile({
        path: FACET_CONFIG_JSON,
      });

      configFile.load(function(err) {
        assertValidAppConfig(configFile);
        done();
      });
    });
  });

  describe('configFile.exists(cb)', function() {
    it('should return true if the file exists', function(done) {
      const configFile = new ConfigFile({
        path: FACET_CONFIG_JSON,
      });

      configFile.exists(function(err, exists) {
        expect(exists).to.equal(true);
        done();
      });
    });
  });

  describe('configFile.save(cb)', function() {
    it('should save the configFile data', function(done) {
      const configFile = new ConfigFile({
        path: FACET_CONFIG_JSON,
        data: {foo: 'bar'},
      });

      configFile.save(function(err) {
        if (err) return done(err);
        configFile.load(function(err) {
          if (err) return done(err);
          expect(configFile.data.foo).to.equal('bar');
          done();
        });
      });
    });
  });

  describe('configFile.remove(cb)', function() {
    it('should remove the configFile', function(done) {
      const configFile = new ConfigFile({
        path: FACET_CONFIG_JSON,
        data: {foo: 'bar'},
      });

      configFile.remove(function(err) {
        if (err) return done(err);
        configFile.exists(function(err, exists) {
          if (err) return done(err);
          expect(exists).to.equal(false);
          done();
        });
      });
    });
  });

  describe('ConfigFile.find(cb)', function() {
    beforeEach(function(done) {
      let files = this.testFiles = [
        FACET_CONFIG_JSON,
        'my-facet/datasources.json',
        'my-facet/model-config.json',
        'my-facet/models/todo.json',
      ];

      files = files.map(function(file) {
        return {path: file};
      });

      async.each(files, ConfigFile.create, done);
    });
    it('should list all files in the workspace', function(done) {
      const testFiles = this.testFiles;
      ConfigFile.find(function(err, configFiles) {
        const fileNames = configFiles.map(function(configFile) {
          return configFile.path;
        });

        expect(fileNames.sort()).to.eql(testFiles.sort());
        done();
      });
    });
  });

  describe('configFile.getFacetName()', function() {
    it('should be the name of the app', function() {
      expectFacetNameForPath('my-app', 'my-app/datasource.json');
      expectFacetNameForPath('my-app', 'my-app/models/todo.json');
      expectFacetNameForPath(ConfigFile.ROOT_COMPONENT, 'config.json');

      function expectFacetNameForPath(facetName, path) {
        const configFile = new ConfigFile({
          path: path,
        });

        expect(configFile.getFacetName()).to.equal(facetName);
      }
    });
  });

  describe('configFile.getDirName()', function() {
    it('should be the name of the app', function() {
      expectDirName('foo/bar/bat/baz.json', 'bat');
      expectDirName('baz.json', '.');

      function expectDirName(path, dir) {
        const configFile = new ConfigFile({
          path: path,
        });

        expect(configFile.getDirName()).to.equal(dir);
      }
    });
  });

  describe('configFile.getExtension()', function() {
    it('should be the extension of the file at the given path', function() {
      const configFile = new ConfigFile({
        path: 'foo/bar.bat.baz.json',
      });
      expect(configFile.getExtension()).to.equal('.json');
    });
  });

  describe('configFile.getBase()', function() {
    it('should be the extension of the file at the given path', function() {
      const configFile = new ConfigFile({
        path: 'foo/bar.bat.baz.json',
      });
      expect(configFile.getBase()).to.equal('bar.bat.baz');
    });
  });

  describe('ConfigFile.toAbsolutePath(relativePath)', function() {
    it('should resolve a relative workspace path to an absolute path', function() {
      const abs = ConfigFile.toAbsolutePath('.');
      expect(abs).to.equal(support.SANDBOX);
    });
  });

  describe('ConfigFile.findFacetFiles(cb)', function() {
    beforeEach(function(done) {
      const files = this.testFiles = [
        FACET_CONFIG_JSON,
        'app-a/datasources.json',
        'app-b/model-config.json',
        'app-c/models/todo.json',
      ];

      async.each(pathsToConfigFiles(files), ConfigFile.create, done);
    });

    beforeEach(function(done) {
      const test = this;
      ConfigFile.findFacetFiles(function(err, facets) {
        if (err) return done(err);
        test.facets = facets;
        done();
      });
    });

    it('should find and group files by app', function() {
      const facets = this.facets;
      let flattenFoundFiles = [];
      Object.keys(facets).forEach(function(name) {
        flattenFoundFiles = flattenFoundFiles
          .concat(configFilesToPaths(facets[name]));
      });
      expect(this.testFiles.sort()).to.eql(flattenFoundFiles.sort());
    });
  });

  describe('ConfigFile.getFileByBase(configFiles, base)', function() {
    it('should find the file with the given base', function() {
      const configFiles = [
        new ConfigFile({path: 'foo/bar/bat.json'}),
        new ConfigFile({path: 'foo/bar/baz.json'}),
      ];

      expect(ConfigFile.getFileByBase(configFiles, 'baz')).to.equal(configFiles[1]);
    });
  });

  describe('ConfigFile.getModelDefFiles(configFiles, facetName)', function() {
    it('should find model files in the given facet', function() {
      const configFiles = [
        new ConfigFile({path: 'facet-a/models/foo.json'}),
        new ConfigFile({path: 'facet-a/models/bar.json'}),
        new ConfigFile({path: 'facet-b/models/foo.json'}),
        new ConfigFile({path: 'models/foo.json'}),
      ];

      const aModels = ConfigFile.getModelDefFiles(configFiles, 'facet-a');
      const bModels = ConfigFile.getModelDefFiles(configFiles, 'facet-b');
      const rootModels = ConfigFile.getModelDefFiles(configFiles, '.');

      expect(configFilesToPaths(aModels).sort())
        .to.eql(['facet-a/models/foo.json', 'facet-a/models/bar.json'].sort());
      expect(configFilesToPaths(bModels)).to.eql(['facet-b/models/foo.json']);
      expect(configFilesToPaths(rootModels)).to.eql(['models/foo.json']);
    });
  });
});

function assertValidAppConfig(configFile) {
  assertIsConfigFile(configFile);
  expect(configFile.data).to.eql(testData);
}

function assertIsConfigFile(configFile) {
  assert(configFile instanceof ConfigFile);
}

function configFilesToPaths(configFiles) {
  return configFiles.map(function(configFile) {
    return configFile.path;
  });
}

function pathsToConfigFiles(paths) {
  return paths.map(function(path) {
    return new ConfigFile({path: path});
  });
}

