const jwt = require('jsonwebtoken');

function employeeOnly(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).render('account/login', {
      title: 'Login',
      message: 'You must be logged in as an employee or admin to access that page.',
      layout: './layouts/layout',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const accountType = decoded.account_type;

    if (accountType === 'Employee' || accountType === 'Admin') {
      return next();
    } else {
      return res.status(403).render('account/login', {
        title: 'Login',
        message: 'You do not have permission to access that page.',
        layout: './layouts/layout',
      });
    }
  } catch (err) {
    return res.status(401).render('account/login', {
      title: 'Login',
      message: 'Session expired or invalid. Please log in again.',
      layout: './layouts/layout',
    });
  }
}

module.exports = employeeOnly;
