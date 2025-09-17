const invModel = require("../models/inventory-model")
const Util = require("../utilities/")

const invController = {}

async function buildByClassificationId(req, res, next) {
  const classificationId = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classificationId)
  if (!data || data.length === 0) {
    const err = new Error("No vehicles found for this classification")
    err.status = 404
    throw err
  }
  const grid = await Util.buildClassificationGrid(data)
  const nav = await Util.getNav()
  const classificationName = data[0].classification_name
  res.render("./inventory/classification", {
    title: `${classificationName} Vehicles`,
    nav,
    grid
  })
}

async function buildByInventoryId(req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  if (!data) {
    const err = new Error("Vehicle not found")
    err.status = 404
    throw err
  }
  const detailView = await Util.buildVehicleDetailHtml(data)
  const nav = await Util.getNav()
  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detailView,
    vehicle: data
  })
}

async function triggerError(req, res, next) {
  throw new Error("Test 500 Error: This is an intentional server error")
}

module.exports = invController