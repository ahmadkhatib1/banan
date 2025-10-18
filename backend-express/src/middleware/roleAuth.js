/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions. Required role: ' + allowedRoles.join(' or ')
      });
    }

    next();
  };
};

/**
 * Check if user is admin (CONTENT_ADMIN or SUPER_ADMIN)
 */
const requireAdmin = (req, res, next) => {
  return requireRole(['CONTENT_ADMIN', 'SUPER_ADMIN'])(req, res, next);
};

/**
 * Check if user is super admin
 */
const requireSuperAdmin = (req, res, next) => {
  return requireRole(['SUPER_ADMIN'])(req, res, next);
};

/**
 * Check if user is instructor or admin
 */
const requireInstructor = (req, res, next) => {
  return requireRole(['INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN'])(req, res, next);
};

module.exports = {
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireInstructor
};