const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accounts-controller');
const utilities = require('../utilities/');  // Added for handleErrors (if not present)
const { body } = require('express-validator');

// Validation for account info (firstname, lastname, email - required)
const accountInfoValidation = [
  body('account_firstname')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters.')
    .matches(/^[A-Za-zÀ-ÿ ,.'-]+$/)
    .withMessage('First name contains invalid characters.')
    .escape(),
  body('account_lastname')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters.')
    .matches(/^[A-Za-zÀ-ÿ ,.'-]+$/)
    .withMessage('Last name contains invalid characters.')
    .escape(),
  body('account_email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
];

// Validation for password (strength rules - used in register and optional in update)
const passwordValidation = [
  body('account_password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*).'),
];

// Custom validator for password confirmation match
const confirmPasswordValidation = [
  body('account_password_confirm')
    .notEmpty()
    .withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.account_password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

// Combined validation for update (info required + password optional but validated if present)
const updateValidation = [
  ...accountInfoValidation,
  // Password optional: If provided, validate strength and match
  body('account_password')
    .optional({ checkFalsy: true })  // Optional: Skip if empty/null/falsey
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters if provided.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter if provided.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number if provided.')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*) if provided.'),
  body('account_password_confirm')
    .optional({ checkFalsy: true })
    .custom((value, { req }) => {
      if (req.body.account_password && value !== req.body.account_password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
    .withMessage('Passwords do not match if provided.'),
];

// Validation for login (unchanged)
const loginValidation = [
  body('account_email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('account_password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// Validation for registration (info + password + confirm)
const registerValidation = [
  ...accountInfoValidation,
  ...passwordValidation,
  ...confirmPasswordValidation,
];

// Task 3: GET account management view
router.get('/manage', utilities.handleErrors(accountsController.buildAccountManagementView));

// Login routes
router.get('/login', utilities.handleErrors(accountsController.buildLoginView));
router.post('/login', loginValidation, utilities.handleErrors(accountsController.processLogin));

// Registration routes
router.get('/register', utilities.handleErrors(accountsController.buildRegisterView));
router.post('/register', registerValidation, utilities.handleErrors(accountsController.processRegister));

// Task 5: GET update account view
router.get('/update/:accountId', utilities.handleErrors(accountsController.buildUpdateAccountView));

// Task 5: POST combined update (info + optional password)
router.post('/update', updateValidation, utilities.handleErrors(accountsController.updateAccountInfo));  // Assumes controller handles password if present

// Task 6: Logout route (enhanced: destroy session)
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      } else {
        console.log('Session destroyed successfully');
      }
    });
  }
  // FIXED: Safe flash (check session before calling)
  if (req.session) {
    req.flash('message', 'You have been logged out successfully.');
  } else {
    console.warn('No session to flash message on logout');
  }
  res.redirect('/');
});

module.exports = router;