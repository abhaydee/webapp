const { Pool } = require('pg');

const pool = new Pool({
  user: 'abhaydeshpande',
  host: 'localhost',
  database: 'abhaydeshpande',
  password: 'abhaydeshpande',
  port: 5432,
});

export const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS authusers (
    email VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    account_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
`;

pool.query(createUserTableQuery)
  .then(() => {
    console.log('User table created successfully');
    pool.end();
  })
  .catch((error) => console.error('Error creating user table:', error));
