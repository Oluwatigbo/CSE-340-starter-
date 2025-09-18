// controllers/inventory-controller.js
const inventoryModel = require('../models/inventory-model');
const utilities = require('../utilities');

async function buildVehicleDetail(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await inventoryModel.getVehicleById(inv_id);

    if (!vehicleData) {
      const error = new Error('Vehicle not found');
      error.status = 404;
      return next(error);
    }

    const vehicleDetailHTML = utilities.buildVehicleDetailHTML(vehicleData);

    res.render('inventory/detail', {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      vehicleDetailHTML,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  buildVehicleDetail,
};
