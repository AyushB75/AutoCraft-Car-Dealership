export function errorHandler(err, req, res, next) {
  let status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
  let message = err.message;
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid input. Check required fields, price, and stock quantity.';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid input value.';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Email already exists';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }
  if (status >= 500 || status < 400) { status = 500; message = 'Internal Server Error'; }
  res.status(status).json({ message });
}
