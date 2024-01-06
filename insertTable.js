const { Pool } = require('pg');

const pool = new Pool({
  user: 'abhaydeshpande',
  host: 'localhost',
  database: 'abhaydeshpande',
  password: 'abhaydeshpande',
  port: 5432,
});

const insertSampleDataQuery = `
  INSERT INTO authusers (firstname,lastname, email, password, account_created, account_updated)
  VALUES
    ('abhay@gmail.com', 'deshpande','abhay@example.com', 'password1', NOW(), NOW()),
    ('nisha@gmail.com', 'gowda','nisha@example.com', 'password2', NOW(), NOW()),
`;

pool.query(insertSampleDataQuery)
  .then(() => {
    console.log('Sample data inserted successfully');
    pool.end();
  })
  .catch((error) => console.error('Error inserting sample data:', error));
