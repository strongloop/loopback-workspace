
var app = require("../../server/app.js");
var ModelDefinition = app.models.ModelDefinition;
var ModelMethod = app.models.ModelMethod;
var Workspace = app.models.Workspace;
var ModelProperty = app.models.ModelProperty;

module.exports = function(Client) {

Client.migrate = function(taskid, cb) {
  //cb(null,"success");
  //myFunc(taskid);
  var DataSource = require('loopback-datasource-juggler').DataSource;
  var ds = Client.app.datasources.postgresql;  
  ds.automigrate("Client",function(err, res){
    cb(err, res);
  });
};

Client.indexes = function(cb) {
  //cb(null,"success");
  //myFunc(taskid);
  var DataSource = require('loopback-datasource-juggler').DataSource;
  var ds = Client.app.datasources.postgresql;  
  var cardModel = ds.getModel("Client");
  ds.connector.discoverModelIndexes('Client', function(err, indexes){
    cb(err, indexes);
  });
};

Client.remoteMethod
(
    "migrate",
          {
            accepts: [{arg: 'taskid', type: 'string'}],
            returns: [{arg: 'transferResponse', type: 'object',  http: {source: 'res'} , root:true }],
            http: {verb: 'GET', path: '/migrate/:taskid'}
          }
);

Client.remoteMethod
(
    "indexes",
          {
            returns: [{arg: 'transferResponse', type: 'object',  http: {source: 'res'} , root:true }],
            http: {verb: 'GET', path: '/indexes'} 
          }
);

/*Client.beforeRemote("**", function( ctx, next) { 
 console.log("REMOTE Method invoked....");
 next();
});*/

Client.ulalalaa = function(taskid, cb) {
  myFunc(taskid);
  cb(null,"success");
};

Client.remoteMethod
(
    "ulalalaa",
          {
            accepts: [{arg: 'taskid', type: 'string'}],
            returns: [{arg: 'transferResponse', type: 'object',  http: {source: 'res'} , root:true }],
            http: {verb: 'GET', path: '/ulalalaa/:taskid'}
          }
);

};


function createMethods(userModel, start){
          ModelMethod.create(
          {
            modelId: userModel.id,
            name: 'testMethod'+start,
            isStatic: true,
          },
          function(err) {
            if(err) {
              console.log(err);
            }  
          });
}

function createProperties(userModel, start){
    var property = {
      name: "testProperty"+start,
      type: 'String',
      isId: false,
      modelId: userModel.id,
    };
    ModelProperty.create(property, function(err, property) {
      if (err) {
        console.log(err);  
      }
    });
}

function myFunc(taskid) {
  var workspace = Workspace.loadWorkspace("/Users/deepak/projects/apidev/releases/apiFolder", function (err){
      // make modifications using the workspace API
          ModelDefinition.create(
          {
            name: taskid,
            facetName: 'common',
          },
          function(err) {
              if(err) {
              } else {
              ModelDefinition.findById("common."+taskid,
                function(err, result) {
                    if(err){
                    } else {
                        for(var i=0; i<1; i++) { 
                            createMethods(result, i);  
                            createProperties(result, i); 
                        }
                    }
                });
              }
            });
         });
}

/*var DataSource = require('loopback-datasource-juggler').DataSource;
var db = new DataSource('mysql', {
        host: 'localhost',
        port: 3306,
        database: 'test',
        username: 'test',
        password: 'test'
    });*/
  /*var ds = Client.app.datasources.mysql;  
  var cardModel = ds.getModel("Client");
  ds.autoupdate("Client",function(err, res){
     if(err){
      console.log(cb(null,err));
    } else 
      console.log(cb(null,"received"));
  });*/
  /*console.log("Task Id is " +taskid);
  db.connector.execute("SELECT * FROM INFORMATION_SCHEMA.TABLES",function(err, r){
    console.log(err);
    console.log(r);
  });*/

/*function loadSpace (taskid, i){
          var folder = "/Users/deepak/projects/apidev/releases/apiFolder";

          Workspace.loadWorkspace(folder, function (err){
              if(err)
              ModelDefinition.findById("common."+taskid,
                function(err, result) {
                    if(err){
                        console.log("===================ERROR 2======================"+err);
                    } else {
                      console.log("method "+i);
                      createMethods(result, i);
                    }
              }); 
          });
}*/
