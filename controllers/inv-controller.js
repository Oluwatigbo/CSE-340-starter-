const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

async function buildByClassificationId(req, res, next) {
  // Existing classification view logic
}

async function buildByInventoryId(req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  if (!data) {
    const err = new Error("Vehicle not found")
    err.status = 404
    throw err
  }
  const detailView = await utilities.buildVehicleDetailHtml(data)
  const nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detailView,
    vehicle: data
  })
}

async function triggerError(req, res, next) {
  // Intentional error for testing
  throw new Error("Test 500 Error: This is an intentional server error")
}

module.exports = invController