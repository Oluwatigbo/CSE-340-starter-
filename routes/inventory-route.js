const express = require("express");
const router = new express.Router();
const invController = require("../controllers/inv-controller");
const utilities = require("../utilities/");
const employeeOnly = require("../middleware/employeeOnly"); // Added for Task 2 admin protection
const { body } = require('express-validator'); // For inline validation rules

// New: Root route for /inv (main inventory listing - fixes 404)
router.get("/", utilities.handleErrors(invController.buildInventoryList));

// Public routes (no middleware - for site visitors)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// New: POST review submission (with INLINE validation) - Public but auth-checked in controller
router.post("/detail/:invId/review",
  [ // Inline validation for review (self-contained, no utilities dependency)
    body('review_rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5 stars.'),
    body('review_comment')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Comment must be between 10 and 500 characters.')
      .escape()
  ],
  utilities.handleErrors(invController.submitReview)
);

// New: POST delete review (admin only; no validation needed beyond auth in controller)
router.post("/detail/:invId/review/:review_id/delete",
  utilities.handleErrors(invController.deleteReview)
);

// Admin routes (protected by employeeOnly middleware - for add/edit/delete from Task 2)
router.get("/add-classification", employeeOnly, utilities.handleErrors(invController.buildAddClassificationView));
router.post("/add-classification", 
  employeeOnly, 
  [ // Inline validation for classification name
    body('classification_name')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Classification name must be 2-30 characters.')
      .escape()
  ], 
  utilities.handleErrors(invController.addClassification)
);

router.get("/add-inventory", employeeOnly, utilities.handleErrors(invController.buildAddInventoryView));
router.post("/add-inventory", 
  employeeOnly, 
  [ // Inline validation for inventory form
    body('inv_make')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Make must be 2-50 characters.')
      .escape(),
    body('inv_model')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Model must be 2-50 characters.')
      .escape(),
    body('inv_year')
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be a valid integer (1886 to current year).'),
    body('inv_description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be 1-500 characters.')
      .escape(),
    body('inv_image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL.'),
    body('inv_thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL.'),
    body('inv_price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
    body('classification_id')
      .isInt({ min: 1 })
      .withMessage('Valid classification required.')
  ], 
  utilities.handleErrors(invController.addInventory)
);

router.get("/edit-inventory/:invId", employeeOnly, utilities.handleErrors(invController.buildEditInventoryView));
router.post("/edit-inventory", 
  employeeOnly, 
  [ // Inline validation for edit inventory (similar to add)
    body('inv_id')
      .isInt({ min: 1 })
      .withMessage('Invalid inventory ID.'),
    body('inv_make')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Make must be 2-50 characters.')
      .escape(),
    body('inv_model')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Model must be 2-50 characters.')
      .escape(),
    body('inv_year')
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be a valid integer (1886 to current year).'),
    body('inv_description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be 1-500 characters.')
      .escape(),
    body('inv_image')
      .optional()
      .isURL()
      .withMessage('Image must be a valid URL.'),
    body('inv_thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL.'),
    body('inv_price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
    body('classification_id')
      .isInt({ min: 1 })
      .withMessage('Valid classification required.')
  ], 
  utilities.handleErrors(invController.updateInventory)
);

router.get("/delete-inventory/:invId", employeeOnly, utilities.handleErrors(invController.buildDeleteInventoryView));
router.post("/delete-inventory", 
  employeeOnly, 
  [ // Inline validation for delete confirmation
    body('inv_id')
      .isInt({ min: 1 })
      .withMessage('Invalid inventory ID.')
  ], 
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;