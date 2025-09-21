const inventoryModel = require('../models/inventory-model');
const utilities = require('../utilities');
const { validationResult } = require('express-validator');

// Existing vehicle detail function
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
      layout: './layouts/layout',
    });
  } catch (err) {
    next(err);
  }
}

// Task 1: Management View
async function buildManagementView(req, res, next) {
  const message = req.flash('message');
  res.render('inventory/management', {
    title: 'Inventory Management',
    message: message.length > 0 ? message : null,
    layout: './layouts/layout',
  });
}

// Task 2: Add Classification Views and Logic
async function buildAddClassificationView(req, res, next) {
  const message = req.flash('message');
  const errors = req.flash('errors');
  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    message: message.length > 0 ? message : null,
    errors: errors.length > 0 ? errors : null,
    layout: './layouts/layout',
  });
}

async function addClassification(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errors', errors.array().map(e => e.msg));
    return res.redirect('/inv/add-classification');
  }

  try {
    const classification_name = req.body.classification_name;
    const result = await inventoryModel.addClassification(classification_name);
    if (result.rowCount > 0) {
      req.flash('message', `Classification "${classification_name}" added successfully.`);
      return res.redirect('/inv/');
    } else {
      req.flash('errors', ['Failed to add classification.']);
      return res.redirect('/inv/add-classification');
    }
  } catch (error) {
    next(error);
  }
}

// Task 3: Add Inventory Views and Logic
async function buildAddInventoryView(req, res, next) {
  const classificationList = await utilities.buildClassificationList();
  const message = req.flash('message');
  const errors = req.flash('errors');
  res.render('inventory/add-inventory', {
    title: 'Add New Inventory',
    classificationList,
    message: message.length > 0 ? message : null,
    errors: errors.length > 0 ? errors : null,
    layout: './layouts/layout',
    // Sticky form values default to empty or no-image paths
    inv_make: '',
    inv_model: '',
    inv_description: '',
    inv_image: '/images/no-image.png',
    inv_thumbnail: '/images/no-image.png',
    inv_price: '',
    inv_year: '',
    inv_miles: '',
  });
}

async function addInventory(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory',
      classificationList,
      errors: errors.array().map(e => e.msg),
      layout: './layouts/layout',
      // Sticky form values from submitted data
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
    });
  }

  try {
    const result = await inventoryModel.addInventoryItem({
      classification_id: req.body.classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
    });

    if (result.rowCount > 0) {
      req.flash('message', `Inventory item "${req.body.inv_make} ${req.body.inv_model}" added successfully.`);
      return res.redirect('/inv/');
    } else {
      req.flash('errors', ['Failed to add inventory item.']);
      return res.redirect('/inv/add-inventory');
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildVehicleDetail,
  buildManagementView,
  buildAddClassificationView,
  addClassification,
  buildAddInventoryView,
  addInventory,
};
