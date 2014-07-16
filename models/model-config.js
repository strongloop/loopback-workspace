var app = require('../app');

/**
 * Defines a model configuration which attaches a model to a facet and a
 * dataSource. It also can extend a model definition with additional configuration.
 *
 * @class ModelDefinition
 * @inherits Definition
 */

var ModelConfig = app.models.ModelConfig;

/**
 * - `name` is required and must be unique per `Facet`
 * - `facetName` is required and must refer to an existing facet
 * 
 * @header Property Validation
 */

ModelConfig.validatesUniquenessOf('name', { scopedTo: ['facetName'] });
ModelConfig.validatesPresenceOf('name');
ModelConfig.validatesPresenceOf('facetName');
