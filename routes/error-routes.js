// routes/error-routes.js
const express = require('express');
const router = express.Router();
const errorController = require('../controllers/error-controller');

router.get('/trigger-error', errorController.triggerError);

module.exports = router;
