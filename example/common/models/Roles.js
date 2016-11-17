var app = require("../../server/app.js");

module.exports = function(Roles) {

function migrate(){
      ds.automigrate("Users",function(err, res){
      if(err){
        console.log(cb(err,null));
      } else{ 
        ds.automigrate("RoleUsers",function(err, res){
        if(err){
          console.log(cb(err,null));
        } else {
            ds.automigrate("Roles",function(err, res){
            if(err){
              console.log(cb(err,null));
            } else {
              console.log(cb(null,"received"));
            }
        });
       }  
     });
    }
  });
}

}