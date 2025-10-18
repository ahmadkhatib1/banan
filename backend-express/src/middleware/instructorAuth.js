/**
 * Instructor authorization middleware
 * Requires user to be authenticated and have INSTRUCTOR or ADMIN role
 */
const instructorAuth = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has instructor or admin role
    if (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Instructor or admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Instructor auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = instructorAuth;