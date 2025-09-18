// database/connection.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Make sure this is set in your .env file
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;

