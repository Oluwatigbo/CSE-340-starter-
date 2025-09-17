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

async function buildClassificationGrid(vehicles) {
  let grid = '<div class="vehicle-grid">'
  if (vehicles.length > 0) {
    vehicles.forEach(vehicle => {
      grid += `
        <div class="vehicle-item">
          <a href="/inv/detail/${vehicle.inv_id}">
            <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
            <h3>${vehicle.inv_make} ${vehicle.inv_model}</h3>
            <p>Price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price)}</p>
          </a>
        </div>
      `
    })
  } else {
    grid += '<p>No vehicles found.</p>'
  }
  grid += '</div>'
  return grid
}

async function getNav() {
  const classifications = await invModel.getClassifications()
  let navList = '<ul>'
  classifications.forEach(classification => {
    navList += `<li><a href="/inv/type/${classification.classification_id}">${classification.classification_name}</a></li>`
  })
  navList += '</ul>'
  return navList
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