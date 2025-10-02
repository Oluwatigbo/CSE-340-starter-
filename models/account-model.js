const pool = require('../database/connection'); // Assumes this exports a pg Pool

// Get account info by account_id
async function getAccountById(account_id) {
  const sql = 'SELECT * FROM accounts WHERE account_id = $1';
  const values = [account_id];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// Get account by email (for login and email checks)
async function getAccountByEmail(email) {
  const sql = 'SELECT * FROM accounts WHERE account_email = $1';
  const values = [email];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// Update account info (firstname, lastname, email) by account_id
async function updateAccountInfo(account_id, firstname, lastname, email) {
  const sql = `
    UPDATE accounts
    SET account_firstname = $1,
        account_lastname = $2,
        account_email = $3
    WHERE account_id = $4
    RETURNING *`;
  const values = [firstname, lastname, email, account_id];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// Update password hash by account_id
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE accounts
    SET account_password = $1
    WHERE account_id = $2
    RETURNING *`;
  const values = [hashedPassword, account_id];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

// Check if email exists (excluding current account for updates)
async function checkEmailExists(email, excludeAccountId = null) {
  let sql = 'SELECT account_id FROM accounts WHERE account_email = $1';
  let values = [email];
  if (excludeAccountId) {
    sql += ' AND account_id != $2';
    values.push(excludeAccountId);
  }
  const result = await pool.query(sql, values);
  return result.rowCount > 0;
}

// New: Create a new account (for registration)
async function createAccount(firstname, lastname, email, hashedPassword) {
  const sql = `
    INSERT INTO accounts (account_firstname, account_lastname, account_email, account_password, account_type)
    VALUES ($1, $2, $3, $4, 'Client')
    RETURNING *`;
  const values = [firstname, lastname, email, hashedPassword];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

module.exports = {
  getAccountById,
  getAccountByEmail,
  updateAccountInfo,
  updatePassword,
  checkEmailExists,
  createAccount,
};