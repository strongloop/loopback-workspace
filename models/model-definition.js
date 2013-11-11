var app = require('../');
var ModelDefinition = app.models.ModelDefinition;

ModelDefinition.validatesUniquenessOf('name');
ModelDefinition.validatesPresenceOf('name', 'dataSource');
