/**
 * Global error handling middleware
 * This should be the last middleware in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // MySQL/Database errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry found';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Database table not found';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'ER_BAD_FIELD_ERROR') {
    const message = 'Invalid database field';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ECONNREFUSED') {
    const message = 'Database connection failed';
    error = { message, statusCode: 500 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    error = { message, statusCode: 400, errors };
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = { message, statusCode: 400 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Invalid JSON format';
    error = { message, statusCode: 400 };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Don't expose sensitive error details in production
  const response = {
    success: false,
    message: message
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      stack: err.stack,
      ...error
    };
  }

  // Add validation errors if present
  if (error.errors) {
    response.errors = error.errors;
  }

  // Add error code for client handling
  if (err.code) {
    response.code = err.code;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  
  res.status(404).json({
    success: false,
    message: message
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler
 */
const handleDatabaseError = (err, req, res, next) => {
  if (err.code && err.code.startsWith('ER_')) {
    // MySQL specific error
    console.error('Database Error:', {
      code: err.code,
      message: err.message,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

/**
 * Unhandled promise rejection handler
 */
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  // Close server gracefully
  process.exit(1);
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  // Close server gracefully
  process.exit(1);
});

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  handleDatabaseError
};