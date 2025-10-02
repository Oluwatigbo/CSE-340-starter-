const pool = require('../database/connection'); // Your DB pool

// Existing functions (from previous updates)
async function getInventoryByClassificationId(classificationId) {
  const sql = `SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_thumbnail, classification_name 
               FROM public.inventory inv 
               INNER JOIN public.classification cls ON inv.classification_id = cls.classification_id 
               WHERE inv.classification_id = $1`;
  const result = await pool.query(sql, [classificationId]);
  return result.rows;
}

async function getInventoryById(invId) {
  const sql = 'SELECT * FROM public.inventory WHERE inv_id = $1';
  const result = await pool.query(sql, [invId]);
  return result.rows[0];
}

async function getAllVehicles() {
  const sql = 'SELECT * FROM public.inventory ORDER BY inv_year DESC';
  const result = await pool.query(sql);
  return result.rows;
}

// New/Updated: Get all classifications (for nav and dropdowns) - this is what utilities expects
async function getClassifications() {
  const sql = 'SELECT * FROM public.classification ORDER BY classification_name';
  const result = await pool.query(sql);
  return result.rows;
}

// Alias for consistency (if other code uses getAllClassifications)
async function getAllClassifications() {
  return getClassifications();
}

// Admin functions (from previous updates)
async function addClassification(classificationName) {
  const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *';
  const result = await pool.query(sql, [classificationName]);
  return result.rows[0];
}

async function addInventory(data) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id } = data;
  const sql = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
  const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function updateInventory(invId, data) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id } = data;
  const sql = `UPDATE public.inventory 
               SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, 
                   inv_thumbnail = $6, inv_price = $7, classification_id = $8 
               WHERE inv_id = $9 RETURNING *`;
  const values = [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id, invId];
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function deleteInventory(invId) {
  const sql = 'DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *';
  const result = await pool.query(sql, [invId]);
  return result.rowCount > 0;
}

module.exports = {
  getInventoryByClassificationId,
  getInventoryById,
  getAllVehicles,
  getClassifications,  // Key addition: What utilities needs
  getAllClassifications,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventory,
};