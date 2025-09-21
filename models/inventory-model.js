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

async function addClassification(classification_name) {
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1)';
  const values = [classification_name];
  return await pool.query(sql, values);
}

async function addInventoryItem(item) {
  const sql = `INSERT INTO inventory 
    (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
  const values = [
    item.classification_id,
    item.inv_make,
    item.inv_model,
    item.inv_description,
    item.inv_image,
    item.inv_thumbnail,
    item.inv_price,
    item.inv_year,
    item.inv_miles,
  ];
  return await pool.query(sql, values);
}

async function getClassifications() {
  const sql = 'SELECT classification_id, classification_name FROM classification ORDER BY classification_name ASC';
  return await pool.query(sql);
}

module.exports = {
  getVehicleById,
  addClassification,
  addInventoryItem,
  getClassifications,
};
