// models/reviews-model.js
const pool = require('../database/connection');

/* ***********************
 * Reviews Model Functions
 *********************** */

// Create a new review (requires logged-in account_id and inv_id)
async function createReview(inv_id, account_id, rating, comment) {
  try {
    const sql = `
      INSERT INTO public.reviews (inv_id, account_id, review_rating, review_comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const values = [inv_id, account_id, rating, comment.trim()];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {  // Unique violation (user already reviewed this vehicle)
      throw new Error('You have already submitted a review for this vehicle.');
    }
    if (error.code === '23503') {  // Foreign key violation (invalid inv_id or account_id)
      throw new Error('Invalid vehicle or account. Please try again.');
    }
    console.error('createReview error:', error);
    throw new Error('Failed to create review. Please try again.');
  }
}

// Get all reviews for a specific vehicle (with optional join to account for username)
async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname || ' ' || a.account_lastname AS reviewer_name,
             a.account_type
      FROM public.reviews r
      JOIN public.accounts a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC`;
    const values = [inv_id];
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('getReviewsByVehicle error:', error);
    throw error;
  }
}

// Get average rating for a vehicle
async function getAverageRating(inv_id) {
  try {
    const sql = `
      SELECT AVG(review_rating) AS avg_rating,
             COUNT(*) AS review_count
      FROM public.reviews
      WHERE inv_id = $1`;
    const values = [inv_id];
    const result = await pool.query(sql, values);
    return {
      avg_rating: parseFloat(result.rows[0].avg_rating) || 0,
      review_count: parseInt(result.rows[0].review_count) || 0
    };
  } catch (error) {
    console.error('getAverageRating error:', error);
    throw error;
  }
}

// Delete a review (for admins only; by review_id)
async function deleteReview(review_id, admin_account_id) {
  try {
    // Verify admin (simple check; enhance with full auth if needed)
    const adminSql = 'SELECT account_type FROM public.accounts WHERE account_id = $1';
    const adminResult = await pool.query(adminSql, [admin_account_id]);
    if (!adminResult.rows[0] || adminResult.rows[0].account_type !== 'Admin') {
      throw new Error('Only admins can delete reviews.');
    }

    const sql = 'DELETE FROM public.reviews WHERE review_id = $1 RETURNING *';
    const values = [review_id];
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) {
      throw new Error('Review not found.');
    }
    return result.rows[0];
  } catch (error) {
    console.error('deleteReview error:', error);
    throw error;
  }
}

module.exports = {
  createReview,
  getReviewsByVehicle,
  getAverageRating,
  deleteReview,
};