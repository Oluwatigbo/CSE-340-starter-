const accountModel = require('../models/account-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const utilities = require('../utilities/');  // For getNav (add if missing; see note below)

// Task 3: Deliver account management view
async function buildAccountManagementView(req, res, next) {
  const nav = await utilities.getNav().catch(() => []);  // Fallback empty nav
  res.render('account/manage-account', {
    title: 'Account Management',
    nav,
    message: req.flash('message') || null,  // Default null (safe for EJS)
    errors: req.flash('errors') || [],  // Default empty array
    layout: './layouts/layout',
  });
}

// Deliver login view (with empty defaults for potential repopulation)
async function buildLoginView(req, res, next) {
  const nav = await utilities.getNav().catch(() => []);
  res.render('account/login', {
    title: 'Login',
    nav,
    message: req.flash('message') || null,
    errors: req.flash('errors') || [],
    // Empty defaults (if template has repopulation fields)
    account_email: '',
    layout: './layouts/layout',
  });
}

// Process login POST
async function processLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errors', errors.array().map(e => e.msg));  // Array for consistency
    const nav = await utilities.getNav().catch(() => []);
    return res.render('account/login', {
      title: 'Login',
      nav,
      // Repopulate email if provided
      account_email: req.body.account_email || '',
      message: null,  // Explicit null on error
      errors: req.flash('errors') || [],  // Fresh flash + default
      layout: './layouts/layout',
    });
  }

  const { account_email, account_password } = req.body;

  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash('errors', ['Invalid email or password.']);
      const nav = await utilities.getNav().catch(() => []);
      return res.render('account/login', {
        title: 'Login',
        nav,
        account_email: account_email || '',  // Repopulate
        message: null,
        errors: req.flash('errors') || [],
        layout: './layouts/layout',
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash('errors', ['Invalid email or password.']);
      const nav = await utilities.getNav().catch(() => []);
      return res.render('account/login', {
        title: 'Login',
        nav,
        account_email: account_email || '',  // Repopulate
        message: null,
        errors: req.flash('errors') || [],
        layout: './layouts/layout',
      });
    }

    const token = jwt.sign({
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_type: accountData.account_type || 'Client',
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    req.flash('message', [`Welcome back, ${accountData.account_firstname}!`]);  // Array
    return res.redirect('/account/manage');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('errors', ['Login failed. Please try again.']);
    next(error);
  }
}

// Deliver registration view (with empty defaults for form fields)
async function buildRegisterView(req, res, next) {
  const nav = await utilities.getNav().catch(() => []);
  res.render('account/register', {
    title: 'Register',
    nav,
    message: req.flash('message') || null,
    errors: req.flash('errors') || [],
    // Empty defaults for initial GET (prevents "not defined")
    account_firstname: '',
    account_lastname: '',
    account_email: '',
    account_type: 'Client',  // Default
    layout: './layouts/layout',
  });
}

// Process registration POST
async function processRegister(req, res, next) {
  const errors = validationResult(req);
  const { account_firstname, account_lastname, account_email, account_password, account_type = 'Client' } = req.body;

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array().map(e => e.msg));
    const nav = await utilities.getNav().catch(() => []);
    return res.render('account/register', {
      title: 'Register',
      nav,
      // Repopulate from req.body
      account_firstname: account_firstname || '',
      account_lastname: account_lastname || '',
      account_email: account_email || '',
      account_type: account_type || 'Client',
      message: null,
      errors: req.flash('errors') || [],
      layout: './layouts/layout',
    });
  }

  try {
    // Check if email already exists
    const emailExists = await accountModel.checkEmailExists(account_email);
    if (emailExists) {
      req.flash('errors', ['Email address is already in use. Please use a different email.']);
      const nav = await utilities.getNav().catch(() => []);
      return res.render('account/register', {
        title: 'Register',
        nav,
        account_firstname: account_firstname || '',
        account_lastname: account_lastname || '',
        account_email: account_email || '',
        account_type: account_type || 'Client',
        message: null,
        errors: req.flash('errors') || [],
        layout: './layouts/layout',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(account_password, 12);

    // Create new account
    const newAccount = await accountModel.createAccount(
      account_firstname, 
      account_lastname, 
      account_email, 
      hashedPassword, 
      account_type
    );

    if (newAccount) {
      // Auto-login after registration
      const token = jwt.sign({
        account_id: newAccount.account_id,
        account_firstname: newAccount.account_firstname,
        account_type: newAccount.account_type,
      }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      req.flash('message', ['Registration successful! Welcome aboard.']);
      return res.redirect('/account/manage');
    } else {
      req.flash('errors', ['Failed to create account. Please try again.']);
      return res.redirect('/account/register');
    }
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('errors', [error.message || 'Registration failed. Please try again.']);
    next(error);
  }
}

// Task 5: Deliver account update view
async function buildUpdateAccountView(req, res, next) {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    
    if (!res.locals.loggedin || res.locals.accountId !== accountId) {
      req.flash('errors', ['You can only update your own account. Please log in if needed.']);
      return res.redirect('/account/manage');
    }

    const accountData = await accountModel.getAccountById(accountId);
    if (!accountData) {
      req.flash('message', 'Account not found.');
      return res.redirect('/account/manage');
    }
    
    const nav = await utilities.getNav().catch(() => []);
    res.render('account/update-account', {
      title: 'Update Account',
      nav,
      // Pre-fill with account data
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type || 'Client',
      message: req.flash('message') || null,
      errors: req.flash('errors') || [],
      layout: './layouts/layout',
    });
  } catch (error) {
    console.error('Update view error:', error);
    next(error);
  }
}

// Task 5: Handle combined account update (info + optional password)
async function updateAccountInfo(req, res, next) {
  const errors = validationResult(req);
  const { account_id, account_firstname, account_lastname, account_email, account_password, account_password_confirm } = req.body;
  const id = parseInt(account_id, 10);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array().map(e => e.msg));
    const nav = await utilities.getNav().catch(() => []);
    // Fetch current data for repopulation (safe fallback)
    const accountData = await accountModel.getAccountById(id).catch(() => null);
    return res.render('account/update-account', {
      title: 'Update Account',
      nav,
      account_id: id,
      account_firstname: account_firstname || (accountData ? accountData.account_firstname : ''),
      account_lastname: account_lastname || (accountData ? accountData.account_lastname : ''),
      account_email: account_email || (accountData ? accountData.account_email : ''),
      account_type: accountData ? accountData.account_type : 'Client',
      message: null,
      errors: req.flash('errors') || [],
      layout: './layouts/layout',
    });
  }

  try {
    if (!res.locals.loggedin || res.locals.accountId !== id) {
      req.flash('errors', ['You can only update your own account.']);
      return res.redirect('/account/manage');
    }

    // Check email uniqueness (exclude current account)
    const emailExists = await accountModel.checkEmailExists(account_email, id);
    if (emailExists) {
      req.flash('errors', ['Email address is already in use by another account.']);
      const nav = await utilities.getNav().catch(() => []);
      const accountData = await accountModel.getAccountById(id);
      return res.render('account/update-account', {
        title: 'Update Account',
        nav,
        account_id: id,
        account_firstname: account_firstname || accountData.account_firstname,
        account_lastname: account_lastname || accountData.account_lastname,
        account_email: account_email || accountData.account_email,
        account_type: accountData.account_type || 'Client',
        message: null,
        errors: req.flash('errors') || [],
        layout: './layouts/layout',
      });
    }

    // Update account info
    const updatedAccount = await accountModel.updateAccountInfo(id, account_firstname, account_lastname, account_email);
    let successMessages = ['Account information updated successfully.'];

    // Optional: Update password if provided and matches
    if (account_password && account_password_confirm && account_password === account_password_confirm) {
      const hashedPassword = await bcrypt.hash(account_password, 12);
      const passwordUpdated = await accountModel.updatePassword(id, hashedPassword);
      if (passwordUpdated) {
        successMessages.push('Password updated successfully.');
      } else {
        successMessages.push('Info updated, but password change failed.');
      }
    } else if (account_password && (!account_password_confirm || account_password !== account_password_confirm)) {
      // If password provided but mismatch (should be caught by validation, but double-check)
      req.flash('errors', ['Passwords do not match. Please try again.']);
      return res.redirect(`/account/update/${id}`);
    }

    req.flash('message', successMessages);  // Array of messages
    
    // Re-issue JWT with updated info
    const token = jwt.sign({
      account_id: updatedAccount.account_id,
      account_firstname: updatedAccount.account_firstname,
      account_type: updatedAccount.account_type,
    }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    return res.redirect('/account/manage');
  } catch (error) {
    console.error('Update info error:', error);
    next(error);
  }
}

// Task 5: Handle password-only update (if separate route needed; optional - can remove if using combined)
async function updatePassword(req, res, next) {
  const errors = validationResult(req);
  const { account_id, account_password, account_password_confirm } = req.body;
  const id = parseInt(account_id, 10);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array().map(e => e.msg));
    const nav = await utilities.getNav().catch(() => []);
    const accountData = await accountModel.getAccountById(id).catch(() => null);
    return res.render('account/update-account', {
      title: 'Update Account',
      nav,
      account_id: id,
      account_firstname: accountData ? accountData.account_firstname : '',
      account_lastname: accountData ? accountData.account_lastname : '',
      account_email: accountData ? accountData.account_email : '',
      account_type: accountData ? accountData.account_type : 'Client',
      message: null,
      errors: req.flash('errors') || [],
      layout: './layouts/layout',
    });
  }

  try {
    if (!res.locals.loggedin || res.locals.accountId !== id) {
      req.flash('errors', ['You can only update your own account.']);
      return res.redirect('/account/manage');
    }

    if (account_password !== account_password_confirm) {
      req.flash('errors', ['Passwords do not match.']);
      return res.redirect(`/account/update/${id}`);
    }

    const hashedPassword = await bcrypt.hash(account_password, 12);
    const updatedAccount = await accountModel.updatePassword(id, hashedPassword);
    if (updatedAccount) {
      req.flash('message', ['Password updated successfully.']);
      return res.redirect('/account/manage');
    } else {
      req.flash('errors', ['Failed to update password.']);
      return res.redirect(`/account/update/${id}`);
    }
  } catch (error) {
    console.error('Update password error:', error);
    next(error);
  }
}

module.exports = {
  buildAccountManagementView,
  buildLoginView,
  processLogin,
  buildRegisterView,
  processRegister,
  buildUpdateAccountView,
  updateAccountInfo,
  updatePassword,  // Optional: Keep if separate route; remove if only using combined
};