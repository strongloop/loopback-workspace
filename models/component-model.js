var app = require('../app');

/**
 * Defines a Components model configuration which attaches a model to a component and a
 * dataSource. It also can extend a model definition with additional configuration.
 *
 * @class ModelDefinition
 * @inherits Definition
 */

var ComponentModel = app.models.ComponentModel;

/**
 * - `name` is required and must be unique per `ComponentDefinition`
 * - `componentName` is required and must refer to an existing component
 * 
 * @header Property Validation
 */

ComponentModel.validatesUniquenessOf('name', { scopedTo: ['component'] });
ComponentModel.validatesPresenceOf('name');
ComponentModel.validatesPresenceOf('componentName');
