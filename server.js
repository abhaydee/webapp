var express = require("express");
var app = express();
const nocache = require('nocache');

app.use(nocache());
//we will initialize the database connection
const { Pool } = require("pg");
const { Client } = require("pg");
let databaseStatus = 503;
const databaseConnection = async () => {
  const pool = new Pool({
    user: "abhaydeshpande",
    host: "localhost",
    database: "abhaydeshpande",
    password: "abhaydeshpande",
    port: 5432,
  });
  pool.options.host = "localhost";

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })
  
  pool.connect((err, client, done)=>{
     if(err) {
        console.log("error connecting to the database", err)
     };
     client.query('SELECT * from users',(err, res)=>{
            if(err){
                console.log("fetching data error",err);
                databaseStatus = 503;
            }
            else {
                console.log("database response", res)
                databaseStatus = 200;
            }
            pool.end()
     })
  })


//   console.log(await pool.query('SELECT NOW()'))

//   const client = new Client({
//     user: "abhaydeshpande",
//     host: "localhost",
//     database: "abhaydeshpande",
//     password: "abhaydeshpande",
//     port: 5432,
//   });

//   await client.connect();

//   console.log(await client.query("SELECT NOW()"));

//   await client.end();
};
databaseConnection();

app.get("/healthz", function (req, res) {
  console.log("cute kanda , muddu bangari");
  res.send(databaseStatus);
});

app.put("/healthz", function(req,res){
    res.send(405);
})


var server = app.listen(8081, function () {
  console.log("app instance running on port 8081");
});
