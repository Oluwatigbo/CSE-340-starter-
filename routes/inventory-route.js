const express = require("express")
const router = new express.Router()
const invController = require("../controllers/inv-controller")
const utilities = require("../utilities/")

// Existing classification routes
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// New detail route
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Intentional error route
router.get("/trigger-error", utilities.handleErrors(invController.triggerError))

module.exports = router