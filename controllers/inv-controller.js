const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invController = {};

// Existing public functions (updated render paths to ./inv/)
async function buildByClassificationId(req, res, next) {
  const classificationId = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classificationId);
  if (!data || data.length === 0) {
    const err = new Error("No vehicles found for this classification");
    err.status = 404;
    throw err;
  }
  const nav = await utilities.getNav();
  let vehicleList = '<ul class="vehicle-list">';
  data.forEach(vehicle => {
    vehicleList += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model}">
          <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
          <h3>${vehicle.inv_make} ${vehicle.inv_model}</h3>
          <p>Price: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price)}</p>
        </a>
      </li>
    `;
  });
  vehicleList += '</ul>';
  res.render("./inv/classification", {  // Updated path: ./inv/
    title: `${data[0].classification_name} Vehicles`,
    nav,
    vehicleList
  });
}

async function buildByInventoryId(req, res, next) {
  const invId = req.params.invId;
  const data = await invModel.getInventoryById(invId);
  if (!data) {
    const err = new Error("Vehicle not found");
    err.status = 404;
    throw err;
  }
  const detailView = await utilities.buildVehicleDetailHtml(data);
  const nav = await utilities.getNav();
  res.render("./inv/detail", {  // Updated path: ./inv/
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detailView,
    vehicle: data
  });
}

async function triggerError(req, res, next) {
  throw new Error("Test 500 Error: This is an intentional server error");
}

// New: Root inventory listing (for /inv - shows all vehicles or classifications)
async function buildInventoryList(req, res, next) {
  try {
    // Fetch all vehicles or classifications (replace with real model call)
    const vehicles = await invModel.getAllVehicles(); // Assume this exists in model; fallback to empty array
    const classifications = await invModel.getAllClassifications(); // Assume this exists
    const nav = await utilities.getNav();
    
    res.render("./inv/inventory", {  // Updated path: ./inv/
      title: "Vehicle Inventory",
      nav,
      vehicles: vehicles || [], // Fallback if no data
      classifications: classifications || []
    });
  } catch (error) {
    console.error('Inventory list error:', error);
    next(error);
  }
}

// Admin functions (placeholders for Task 2 - updated render paths to ./inv/)
async function buildAddClassificationView(req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inv/add-classification", {  // Updated path
    title: "Add Classification",
    nav,
    errors: null // For validation errors
  });
}

async function addClassification(req, res, next) {
  const { classification_name } = req.body;
  try {
    // Placeholder: Add to DB (implement in model)
    const result = await invModel.addClassification(classification_name); // Assume model function
    if (result) {
      req.flash('message', 'Classification added successfully.');
      res.redirect('/inv');
    } else {
      throw new Error('Failed to add classification.');
    }
  } catch (error) {
    req.flash('errors', [error.message]);
    res.redirect('/inv/add-classification');
  }
}

async function buildAddInventoryView(req, res, next) {
  try {
    const classifications = await invModel.getAllClassifications(); // For dropdown
    const nav = await utilities.getNav();
    res.render("./inv/add-inventory", {  // Updated path
      title: "Add Inventory",
      nav,
      classifications,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

async function addInventory(req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id } = req.body;
  try {
    // Placeholder: Add to DB (implement in model)
    const result = await invModel.addInventory({ inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id });
    if (result) {
      req.flash('message', 'Vehicle added successfully.');
      res.redirect('/inv');
    } else {
      throw new Error('Failed to add vehicle.');
    }
  } catch (error) {
    req.flash('errors', [error.message]);
    res.redirect('/inv/add-inventory');
  }
}

async function buildEditInventoryView(req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryById(invId);
    const classifications = await invModel.getAllClassifications();
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    const nav = await utilities.getNav();
    res.render("./inv/edit-inventory", {  // Updated path
      title: "Edit Inventory",
      nav,
      vehicle,
      classifications,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

async function updateInventory(req, res, next) {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id } = req.body;
  try {
    // Placeholder: Update in DB (implement in model)
    const result = await invModel.updateInventory(inv_id, { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, classification_id });
    if (result) {
      req.flash('message', 'Vehicle updated successfully.');
      res.redirect(`/inv/detail/${inv_id}`);
    } else {
      throw new Error('Failed to update vehicle.');
    }
  } catch (error) {
    req.flash('errors', [error.message]);
    res.redirect(`/inv/edit-inventory/${inv_id}`);
  }
}

async function buildDeleteInventoryView(req, res, next) {
  try {
    const invId = req.params.invId;
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    const nav = await utilities.getNav();
    res.render("./inv/delete-inventory", {  // Updated path
      title: "Delete Inventory",
      nav,
      vehicle,
      errors: null
    });
  } catch (error) {
    next(error);
  }
}

async function deleteInventory(req, res, next) {
  const { inv_id } = req.body;
  try {
    // Placeholder: Delete from DB (implement in model)
    const result = await invModel.deleteInventory(inv_id);
    if (result) {
      req.flash('message', 'Vehicle deleted successfully.');
      res.redirect('/inv');
    } else {
      throw new Error('Failed to delete vehicle.');
    }
  } catch (error) {
    req.flash('errors', [error.message]);
    res.redirect(`/inv/delete-inventory/${inv_id}`);
  }
}

// Export all functions
invController.buildByClassificationId = buildByClassificationId;
invController.buildByInventoryId = buildByInventoryId;
invController.triggerError = triggerError;
invController.buildInventoryList = buildInventoryList;
invController.buildAddClassificationView = buildAddClassificationView;
invController.addClassification = addClassification;
invController.buildAddInventoryView = buildAddInventoryView;
invController.addInventory = addInventory;
invController.buildEditInventoryView = buildEditInventoryView;
invController.updateInventory = updateInventory;
invController.buildDeleteInventoryView = buildDeleteInventoryView;
invController.deleteInventory = deleteInventory;

module.exports = invController;