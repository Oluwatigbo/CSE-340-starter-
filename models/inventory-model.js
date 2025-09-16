const pool = require("../database/")

const invModel = {}

async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error: " + error)
    throw error
  }
}

// Existing classification-related functions
async function getClassifications() {
  // Existing classification query logic
}

async function getInventoryByClassificationId(classificationId) {
  // Existing inventory by classification logic
}

module.exports = invModel