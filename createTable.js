const { Pool } = require('pg');

const pool = new Pool({
  user: 'abhaydeshpande',
  host: 'localhost',
  database: 'abhaydeshpande',
  password: 'abhaydeshpande',
  port: 5432,
});

const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    last_login TIMESTAMP,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createUserTableQuery)
  .then(() => {
    console.log('User table created successfully');
    pool.end();
  })
  .catch((error) => console.error('Error creating user table:', error));
