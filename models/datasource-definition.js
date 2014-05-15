var app = require('../');
var DatasourceDefinition = app.models.DatasourceDefinition;

DatasourceDefinition.validatesUniquenessOf('name', { scopedTo: ['projectId'] });
DatasourceDefinition.validatesPresenceOf('name', 'connector');
