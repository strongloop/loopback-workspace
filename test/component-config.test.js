// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const app = require('../');
const path = require('path');
const fs = require('fs-extra');
const expect = require('chai').expect;
const support = require('../test/support');

const ComponentConfig = app.models.ComponentConfig;

describe('ComponentConfig', function() {
  beforeEach(support.givenBasicWorkspace);
  beforeEach(support.findComponentConfigs);

  it('should read data from "component-config.json"', function() {
    expect(this.componentConfigs).to.have.length(1);
    const explorer = this.componentConfigs[0];
    expect(explorer.configFile).to.equal('server/component-config.json');
    // see templates/projects/api-server/files/server/component-config
    expect(explorer.name).to.equal('loopback-component-explorer');
    expect(explorer.value).to.eql({mountPath: '/explorer', generateOperationScopedModels: true});
  });

  it('should write data to "component-config.json"', function() {
    const component = new ComponentConfig({
      facetName: 'server',
      name: 'loopback-component-foobar',
      value: {
        configKey: 'configValue',
      },
    });
    return component.save().then(function() {
      const cfgFile = path.resolve(support.SANDBOX, 'server', 'component-config.json');
      const data = fs.readJsonSync(cfgFile);
      expect(data).to.have.property('loopback-component-foobar');
      expect(data['loopback-component-foobar']).to.eql({
        configKey: 'configValue',
      });
    });
  });
});
