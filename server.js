/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const invRouter = require("./routes/inventory-routes");  // Make sure filename matches
const errorRoutes = require("./routes/error-routes");
const utilities = require("./utilities/");

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * Serve Static Files
 *************************/
app.use(express.static("public"));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", invRouter);
app.use("/error", errorRoutes);

// Index route
app.get(
  "/",
  utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav, layout: "./layouts/layout" });
  })
);

/* ***********************
 * 404 Error Handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Error Handler Middleware
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).render("error", {
    title: "Error",
    message: err.message,
    error: err,
    nav,
    layout: "./layouts/layout",
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
