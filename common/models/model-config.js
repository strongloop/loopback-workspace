// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(ModelConfig) {
  /**
   * Defines a model configuration which attaches a model to a facet and a
   * dataSource. It also can extend a model definition with additional configuration.
   *
   * @class ModelDefinition
   * @inherits Definition
   */

  /**
   * - `name` is required and must be unique per `Facet`
   * - `facetName` is required and must refer to an existing facet
   *
   * @header Property Validation
   */

  ModelConfig.validatesUniquenessOf('name', { scopedTo: ['facetName'] });
  ModelConfig.validatesPresenceOf('name');
  ModelConfig.validatesPresenceOf('facetName');
};
