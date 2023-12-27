const { Pool } = require('pg');

const pool = new Pool({
  user: 'abhaydeshpande',
  host: 'localhost',
  database: 'abhaydeshpande',
  password: 'abhaydeshpande',
  port: 5432,
});

const insertSampleDataQuery = `
  INSERT INTO users (username, email, password, last_login)
  VALUES
    ('user1', 'user1@example.com', 'password1', NOW()),
    ('user2', 'user2@example.com', 'password2', NOW()),
    ('user3', 'user3@example.com', 'password3', NOW());
`;

pool.query(insertSampleDataQuery)
  .then(() => {
    console.log('Sample data inserted successfully');
    pool.end();
  })
  .catch((error) => console.error('Error inserting sample data:', error));
