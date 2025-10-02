// routes/error-routes.js
const express = require('express');
const router = express.Router();
const invController = require('../controllers/inv-controller'); // Reuse for test error

// Trigger a test error (matches footer link)
router.get('/trigger', invController.triggerError);

module.exports = router;
