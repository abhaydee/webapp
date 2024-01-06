var express = require("express");
var app = express();
const nocache = require("nocache");
const bcrypt = require("bcryptjs");
const csvParser = require("csv-parser");
const path = require("path");
app.use(express.json()); // Parse JSON bodies (as sent by API clients)

app.use(express.urlencoded()); // Parse URL-encoded bodies (as sent by HTML forms)

app.use(nocache());
//we will initialize the database connection
const { Pool } = require("pg");
const { Client } = require("pg");
const fs = require("fs");

const result = [];
let basicAuthToken="";

const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS authusers (
    email VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    account_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)
`;

const createAssignmentTableQuery = `
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    num_of_attempts INTEGER NOT NULL,
    deadline TIMESTAMP NOT NULL,
    email VARCHAR(255) REFERENCES authusers(email)
);
`;
// const insertDataQuery = `
//   COPY User(email, password, firstname, lastname)
//   FROM '${path.join(__dirname, "user.csv")}'
//   DELIMITER ','
//   CSV HEADER;
// `;
const pool = new Pool({
    user: "abhaydeshpande",
    host: "localhost",
    database: "abhaydeshpande",
    password: "abhaydeshpande",
    port: 5432,
  });
let databaseStatus = 503;
const databaseConnection = async () => {
  
  pool.options.host = "localhost";

  pool.on("error", (err, client) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  crudUserTable(pool);
  createAssignmentTable(pool);
};
const createAssignmentTable = (pool) => {
  pool.connect((err, client, done) => {
    if (err) {
      console.log("error connecting to the database", err);
    } else {
      databaseStatus = 200;
      client.query(createAssignmentTableQuery, (err, res)=>{
        if(err){
            console.log("cannot create assignment table", err)
        }
        else {
            console.log("assignment table created", res)
        }
      });
    }
  });
};

const authenticateUser = async (email, password) => {
    //check for user existence
    return new Promise((resolve, reject) => {
        let authToken = "";
        let selectUserDataQuery = `SELECT * from authusers WHERE email ='${email}'`;
        pool.query(selectUserDataQuery, async (err, result) => {
            if (err) {
                console.log("user not found, go ahead and create a new user", err);
                resolve("user not found");
            } else {
                console.log("we got the user", result.rows[0]);
                const passwordMatch = bcrypt.compareSync(password, result.rows[0].password);
                    if (!passwordMatch) {
                        console.log("passwords don't match");
                        resolve("password does not match");
                    } else {
                        authToken = 'Basic ' + Buffer.from(email + ':' + password).toString('base64');
                        console.log("logging the auth token", authToken);
                        basicAuthToken = authToken;
                        resolve(authToken);
                    }
                
            }
        });
    });
};

app.post("/login", async (req, res)=>{
    console.log("req", req.body);
    // Log the body separately if needed
    const data = await authenticateUser(req.body.email, req.body.password)
    console.log("data", data)
    if(data.split(" ")[0] == "Basic"){
        res.json({ success : true, message : basicAuthToken})
    } else { 
        res.json({success: false, message : "login failed"})
    }
    // Send a JSON response
})

const crudUserTable = (pool) => {
  pool.connect((err, client, done) => {
    if (err) {
      console.log("error connecting to the database", err);
    } else {
      //creating a new table for users
      databaseStatus = 200;
      client.query(createUserTableQuery, (err, res) => {
        if (err) {
          console.log("cannot create table ", err);
        } else {
          // table successfully created
          console.log("table created", res);
          fs.createReadStream("./user.csv")
            .pipe(csvParser())
            .on("data", (data) => {
              console.log("the file data", data);
              result.push(data);
              bcrypt.genSalt(10, (err, salt) => {
                result.map((userItem) => {
                  console.log("the user item", userItem);
                  let checkExistingUser = `SELECT * FROM authusers WHERE email = '${userItem.email}'`;
                  client.query(checkExistingUser, (err, res) => {
                    if (err) {
                      console.log("error fetching records");
                    } else {
                      if (res.rows.length == 0) {
                        bcrypt.hash(
                          userItem.password,
                          salt,
                          function (err, hash) {
                            // Store hash in the database
                            console.log("the hash", hash);
                            var insertDataQuery =
                              "INSERT INTO authusers (email, password, firstname, lastname, account_created, account_updated) VALUES ('" +
                              userItem.email +
                              "', '" +
                              hash +
                              "', '" +
                              userItem.firstname +
                              "', '" +
                              userItem.lastname +
                              "', '" +
                              new Date().toISOString() +
                              "', '" +
                              new Date().toISOString() +
                              "')";
                            client.query(insertDataQuery, (err, res) => {
                              if (err) {
                                console.log(
                                  "Cannot insert data into the table",
                                  err
                                );
                              } else {
                                console.log(
                                  "data successfully added to the table",
                                  res
                                );
                              }
                            });
                          }
                        );
                      } else {
                        bcrypt.hash(
                          userItem.password,
                          salt,
                          function (err, hash) {
                            // Store hash in the database
                            console.log("the updated hash", hash);
                            var updateQuery = `UPDATE authusers 
                                        SET password = '${hash}', 
                                            firstname = '${
                                              userItem.firstname
                                            }', 
                                            lastname = '${userItem.lastname}', 
                                            account_updated = '${new Date().toISOString()}' 
                                        WHERE email = '${userItem.email}'`;
                            client.query(updateQuery, (err, res) => {
                              if (err) {
                                console.log(
                                  "Cannot update data into the table",
                                  err
                                );
                              } else {
                                console.log(
                                  "data successfully updated to the table",
                                  res
                                );
                                console.log(
                                  "userpassword : hash",
                                  userItem.password + ":" + hash
                                );
                                bcrypt.compare(
                                  userItem.password,
                                  hash,
                                  function (err, result) {
                                    if (result) {
                                      // password is validc
                                      console.log("result is valid", result);
                                    }
                                  }
                                );
                              }
                            });
                          }
                        );
                      }
                    }
                  });
                });
              });
            })
        }
      });
    }
  });
};
databaseConnection();

app.get("/healthz", function (req, res) {
  console.log("cute kanda , muddu bangari");
});

app.put("/healthz", function (req, res) {
  res.send(405);
});

var server = app.listen(8081, function () {
  console.log("app instance running on port 8081");
});
