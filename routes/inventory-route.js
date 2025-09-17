const express = require("express")
const router = new express.Router()
const invController = require("../controllers/inv-controller")
const Util = require("../utilities/")

// Classification view route
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId))

// Detail view route
router.get("/detail/:invId", Util.handleErrors(invController.buildByInventoryId))

// Intentional error route
router.get("/trigger-error", Util.handleErrors(invController.triggerError))

module.exports = router