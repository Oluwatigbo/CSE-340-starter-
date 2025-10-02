// database/connection.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://cse340rebuildproject:pBHjwJK1MpKAWzyW5qFyH7V8DmcIolT3@dpg-d31gun3ipnbc73e41q8g-a.oregon-postgres.render.com/cse340rebuildproject',
  // Or explicit config (uncomment if no DATABASE_URL):
  // host: 'localhost',
  // port: 5432,
  // user: 'postgres',
  // password: 'your_password_here',  // Replace with your actual Postgres password
  // database: 'cse340',
  
  // FIXED: Enable SSL for local dev (bypasses certificate validation)
  ssl: {
    rejectUnauthorized: false  // Set to true for production with valid certs
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup (optional but helpful for debugging)
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully!');
    client.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    // Don't exit on test failure—app can still run with fallbacks
  }
}

module.exports = pool;
testConnection();  // Run on require (logs on server start)