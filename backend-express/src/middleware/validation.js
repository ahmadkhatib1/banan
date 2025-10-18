const { validationResult } = require('express-validator');

/**
 * Validation middleware to handle express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Custom validation middleware for specific business rules
 */
const customValidation = (validationFn) => {
  return async (req, res, next) => {
    try {
      const result = await validationFn(req);
      
      if (result.isValid) {
        next();
      } else {
        return res.status(400).json({
          success: false,
          message: result.message || 'Validation failed',
          errors: result.errors || []
        });
      }
    } catch (error) {
      console.error('Custom validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during validation'
      });
    }
  };
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Recursively sanitize strings in request body
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return obj.trim();
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    next(); // Continue even if sanitization fails
  }
};

/**
 * Validate file upload
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    required = false
  } = options;

  return (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        if (required) {
          return res.status(400).json({
            success: false,
            message: 'File upload is required'
          });
        }
        return next();
      }

      const files = req.files || [req.file];
      
      for (const file of files) {
        if (!file) continue;

        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
          });
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
          });
        }
      }

      next();
    } catch (error) {
      console.error('File validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during file validation'
      });
    }
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Validate page
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Attach validated values to request
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };

    next();
  } catch (error) {
    console.error('Pagination validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during pagination validation'
    });
  }
};

/**
 * Validate sort parameters
 */
const validateSort = (allowedFields = []) => {
  return (req, res, next) => {
    try {
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder || 'asc';

      if (sortBy && allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`
        });
      }

      if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Sort order must be either "asc" or "desc"'
        });
      }

      // Attach validated values to request
      req.sort = {
        sortBy: sortBy || allowedFields[0] || 'createdAt',
        sortOrder: sortOrder.toLowerCase()
      };

      next();
    } catch (error) {
      console.error('Sort validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during sort validation'
      });
    }
  };
};

/**
 * Validate date range parameters
 */
const validateDateRange = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format. Use ISO 8601 format (YYYY-MM-DD)'
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date format. Use ISO 8601 format (YYYY-MM-DD)'
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    next();
  } catch (error) {
    console.error('Date range validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during date range validation'
    });
  }
};

/**
 * Helper function to validate date format
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString.match(/^\d{4}-\d{2}-\d{2}/);
};

module.exports = {
  handleValidationErrors,
  customValidation,
  sanitizeInput,
  validateFileUpload,
  validatePagination,
  validateSort,
  validateDateRange
};