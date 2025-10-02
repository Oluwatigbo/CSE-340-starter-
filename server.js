/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser"); // For Tasks 1 & 6
const jwt = require("jsonwebtoken"); // For Tasks 1 & 2
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const invRouter = require("./routes/inventory-route");
const accountRouter = require("./routes/account-routes"); // New: For Tasks 3-6
const errorRoutes = require("./routes/error-routes");
const utilities = require("./utilities/");

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Required for JWT cookies

// Session middleware for flash messages
app.use(
  session({
    secret: process.env.SESSION_SECRET || "oluwatigbo", // Use env var for security
    resave: false,
    saveUninitialized: true,
  })
);

// Flash message middleware
app.use(flash());

// Task 1: Middleware to set res.locals for login status and user info
app.use((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.loggedin = true;
      res.locals.accountType = decoded.account_type;
      res.locals.firstName = decoded.account_firstname;
      res.locals.accountId = decoded.account_id;
    } catch (err) {
      res.locals.loggedin = false;
      res.clearCookie('jwt'); // Clear invalid token
    }
  } else {
    res.locals.loggedin = false;
  }
  next();
});

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
app.use("/account", accountRouter); // New: Mount account routes for Tasks 3-6
app.use("/error", errorRoutes);

// Index route
app.get(
  "/",
  utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  })
);

// New: Simple About and Contact routes (fixes nav 404s)
app.get('/about', (req, res) => {
  res.render('about', { title: 'About', layout: './layouts/layout' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', layout: './layouts/layout' });
});

// Fix common 404: Serve favicon (create public/favicon.ico or redirect)
app.get('/favicon.ico', (req, res) => res.status(204).end()); // No content, stops 404 spam

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
  let nav;
  try {
    nav = await utilities.getNav(); // Wrap in try-catch if DB issues
  } catch (navErr) {
    console.error('Nav error:', navErr.message);
    nav = []; // Fallback empty nav
  }
  console.error(`Error: ${err.message} for ${req.method} ${req.url}`);
  res.status(err.status || 500).render("error", {
    title: "Error",
    message: err.message,
    error: err,
    nav,
    // Pass flash for consistency (e.g., if error occurs after form submit)
    message: req.flash('message'),
    errors: req.flash('errors'),
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

// New: Startup check for required env vars (prevents silent failures)
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET not set in .env. Set it for secure JWT handling.');
}
if (!process.env.SESSION_SECRET) {
  console.warn('Warning: SESSION_SECRET not set in .env. Using fallback (insecure for production).');
}

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});