// utilities/index.js
const invModel = require('../models/inventory-model');
const { body } = require('express-validator');

/* ***********************
 * Local server functions
 *********************** */

// Builds the navigation HTML for the classification links
async function getNav() {
  try {
    // Fetch classifications from DB
    const data = await invModel.getClassifications();
    
    // Build nav array (standard format: [{ title: 'Sedans', href: '/inv/type/1' }, ...])
    let nav = data.map(classification => ({
      title: classification.classification_name,
      href: `/inv/type/${classification.classification_id}`
    }));
    
    // Add fallback items if no DB data (prevents empty nav)
    if (nav.length === 0) {
      nav = [
        { title: 'All Vehicles', href: '/inv' },
        { title: 'Sedans', href: '/inv/type/1' }, // Assume IDs; adjust if needed
        { title: 'SUVs', href: '/inv/type/2' }
      ];
    }
    
    return nav;
  } catch (error) {
    console.error('getNav error: Failed to load classifications', error.message);
    // Fallback: Return empty array (safe for forEach)
    return [];
  }
}

// Builds vehicle detail HTML (from your original controller)
async function buildVehicleDetailHtml(vehicle) {
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" />
      <h2>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h2>
      <p>${vehicle.inv_description}</p>
      <p class="price">$${vehicle.inv_price.toLocaleString()}</p>
      <ul>
        <li>Color: ${vehicle.inv_color || 'N/A'}</li>
        <li>Mileage: ${vehicle.inv_miles || 'N/A'} miles</li>
        <li>Status: ${vehicle.inv_status || 'Available'}</li>
      </ul>
    </div>
  `;
}

// Error handler utility (wraps async functions) - FIXED: Removed 'async' to return a function, not Promise
function handleErrors(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Validation utilities (for forms)
function getValidationRules() {
  return {
    classification: [body('classification_name').trim().isLength({ min: 2 }).escape()],
    inventory: [
      body('inv_make').trim().isLength({ min: 2 }).escape(),
      body('inv_model').trim().isLength({ min: 2 }).escape(),
      body('inv_year').isInt({ min: 1886, max: new Date().getFullYear() + 1 }),
      // ... other rules
    ]
  };
}

module.exports = {
  getNav,
  buildVehicleDetailHtml,
  handleErrors,
  getValidationRules,
};