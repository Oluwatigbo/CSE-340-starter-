// middleware/error-handler.js
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status);
  res.render('errors/error', {
    title: `${status} Error`,
    message: err.message,
    status,
  });
}

module.exports = errorHandler;
