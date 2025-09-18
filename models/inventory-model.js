// models/inventory-model.js
const pool = require('../database/connection');

async function getVehicleById(inv_id) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inv_id = $1';
    const values = [inv_id];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getVehicleById,
  // other model functions...
};
