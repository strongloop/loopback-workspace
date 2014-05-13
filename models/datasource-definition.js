var app = require('../');
var DatasourceDefinition = app.models.DatasourceDefinition;

DatasourceDefinition.validatesUniquenessOf('name');
DatasourceDefinition.validatesPresenceOf('name', 'connector');
