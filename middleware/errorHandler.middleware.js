const errorHandler = (err, req, res, next) => {
  console.error(err.stack); 

  const statusCode = err.status || err.statusCode || 500;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose cast error 
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // Duplicate key error 
  if (err.code && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      key: err.keyValue
    });
  }

  // Default error
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;
