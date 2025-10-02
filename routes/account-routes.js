const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accounts-controller');
const { body } = require('express-validator');

// Validation for account info update (Task 5)
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

// Validation for password update (Task 5)
const passwordValidation = [
  body('account_password')
    .notEmpty()
    .withMessage('Password cannot be empty.')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*).'),
];

// Validation for login
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

// Validation for registration (reuses account info validation + password)
const registerValidation = [
  ...accountInfoValidation,
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

// Task 3: GET account management view
router.get('/manage', accountsController.buildAccountManagementView);

// Login routes
router.get('/login', accountsController.buildLoginView);
router.post('/login', loginValidation, accountsController.processLogin);

// Registration routes (fixes /account/register 404)
router.get('/register', accountsController.buildRegisterView);
router.post('/register', registerValidation, accountsController.processRegister);

// Task 5: GET update account view
router.get('/update/:accountId', accountsController.buildUpdateAccountView);

// Task 5: POST update account info
router.post('/update', accountInfoValidation, accountsController.updateAccountInfo);

// Task 5: POST update password
router.post('/update-password', passwordValidation, accountsController.updatePassword);

// Task 6: Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  req.flash('message', 'You have been logged out successfully.');
  res.redirect('/');
});

module.exports = router;