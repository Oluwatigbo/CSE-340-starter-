const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory-controller');
const utilities = require('../utilities');
const { body } = require('express-validator');

// Vehicle detail route (existing)
router.get('/detail/:inv_id', inventoryController.buildVehicleDetail);

// Task 1: Management view
router.get('/', utilities.handleErrors(inventoryController.buildManagementView));

// Task 2: Add Classification
router.get('/add-classification', utilities.handleErrors(inventoryController.buildAddClassificationView));
router.post(
  '/add-classification',
  body('classification_name')
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage('Classification name cannot contain spaces or special characters.')
    .notEmpty()
    .withMessage('Classification name is required.'),
  utilities.handleErrors(inventoryController.addClassification)
);

// Task 3: Add Inventory
router.get('/add-inventory', utilities.handleErrors(inventoryController.buildAddInventoryView));
router.post(
  '/add-inventory',
  // Validation rules for inventory fields
  body('classification_id').notEmpty().withMessage('Classification is required.'),
  body('inv_make').trim().notEmpty().withMessage('Make is required.'),
  body('inv_model').trim().notEmpty().withMessage('Model is required.'),
  body('inv_description').trim().notEmpty().withMessage('Description is required.'),
  body('inv_image').trim().notEmpty().withMessage('Image path is required.'),
  body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail path is required.'),
  body('inv_price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
  body('inv_year').isInt({ min: 1900 }).withMessage('Year must be a valid number.'),
  body('inv_miles').isInt({ min: 0 }).withMessage('Mileage must be a non-negative number.'),
  utilities.handleErrors(inventoryController.addInventory)
);

module.exports = router;
