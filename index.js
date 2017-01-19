var express   =    require("express");
var mysql     =    require('mysql');
var app       =    express();
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/host.key', 'utf8');
var certificate = fs.readFileSync('sslcert/host.cert', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var pool      =    mysql.createPool({
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'base',
    debug    :  true
});

//MySQL

function database(req,res, verb) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        if(verb == "select"){
        
        
        connection.query("select * from users WHERE id =" + req.param("id"),function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });


         }else if (verb == "insert"){
          connection.query("INSERT INTO users (username, password, age) VALUES( '" + req.param("username") + "','" + req.param("password") + "'," + req.param("age") + ")",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

         }else if (verb == "update"){
          connection.query("UPDATE users SET username ='" + req.param("username") + "',password ='" + req.param("password") + "', age =" + req.param("age") + " WHERE id =" + req.param("id"),function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

         }else if (verb == "delete"){
          connection.query("DELETE FROM users WHERE id = " + req.param("id") ,function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

         }
         else{
          res.json({"code" : 100, "status" : "Error the verb is unknown"});
              return;  
         }

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
}


 // Express Routes

app.get("/",function(req,res){
 list_parameters = ['id'];
  for(i = 0; i < list_parameters.length; i++){
    param_defined(req, res, list_parameters[i])
  }
  database(req, res, "select");

});

//Check if parameters are defined
function param_defined(req, res, param_name){
if(req.param(param_name) == undefined){
      res.json({"code" : 100, "status" : "Error no parameter found for " + param_name});
      return;
}
}


app.get("/add", function(req, res){
  list_parameters = ['username', 'password', 'age'];
  for(i = 0; i < list_parameters.length; i++){
    param_defined(req, res, list_parameters[i])
  }
  database(req, res, "insert")
res.json({"code" : 200, "status" : "Success, data has been inserted"});

});

app.get("/update", function(req, res){
  list_parameters = ['username', 'password', 'age' , 'id'];
  for(i = 0; i < list_parameters.length; i++){
    param_defined(req, res, list_parameters[i])
  }
  database(req, res, "update")
res.json({"code" : 200, "status" : "Success, data has been updated"});

});

app.get("/delete", function(req, res){
  list_parameters = ['id'];
  for(i = 0; i < list_parameters.length; i++){
    param_defined(req, res, list_parameters[i])
  }
  database(req, res, "delete")
res.json({"code" : 200, "status" : "Success, data has been deleted"});

});


httpServer.listen(8080);
httpsServer.listen(8443);