const invModel = require("../models/inventory-model")
const Util = {}

async function buildVehicleDetailHtml(vehicle) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(vehicle.inv_price)
  
  const formattedMileage = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)
  
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" />
      </div>
      <div class="vehicle-details">
        <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <div class="vehicle-info">
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> ${formattedPrice}</p>
          <p><strong>Mileage:</strong> ${formattedMileage} miles</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `
}

async function getNav() {
  // Existing navigation logic
}

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = Util