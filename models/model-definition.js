var app = require('../');
var ModelDefinition = app.models.ModelDefinition;

ModelDefinition.validatesUniquenessOf('name', { scopedTo: ['projectId'] });
ModelDefinition.validatesPresenceOf('name', 'dataSource');
