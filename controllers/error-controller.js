// controllers/error-controller.js
function triggerError(req, res, next) {
  try {
    throw new Error('Intentional 500 error triggered!');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  triggerError,
};
