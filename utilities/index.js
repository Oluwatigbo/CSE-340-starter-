// utilities/index.js

function formatPriceUSD(price) {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatMileage(mileage) {
  return mileage.toLocaleString('en-US');
}

function buildVehicleDetailHTML(vehicle) {
  return `
    <div class="vehicle-detail-container">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
      </div>
      <div class="vehicle-info">
        <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Price:</strong> ${formatPriceUSD(vehicle.inv_price)}</p>
        <p><strong>Mileage:</strong> ${formatMileage(vehicle.inv_miles)} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      </div>
    </div>
  `;
}

// Async error handler wrapper for Express routes
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Example getNav function returning navigation data
async function getNav() {
  // Replace this with your actual nav building logic or database call
  return [
    { name: 'Home', link: '/' },
    { name: 'Inventory', link: '/inv' },
    { name: 'About', link: '/about' },
    { name: 'Contact', link: '/contact' },
  ];
}

module.exports = {
  buildVehicleDetailHTML,
  handleErrors,
  getNav,
};
