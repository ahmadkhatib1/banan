const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class UserService {
  // Register new user
  static async register(userData) {
    const { email, username, password, firstName, lastName, role = 'STUDENT' } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
      role
    });
    
    
    // Generate tokens
    const tokens = this.generateTokens(user);
   

    // Update refresh token in database
    await User.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  // Login user
  static async login({email, password}) {
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Update refresh token and last login
    await User.updateRefreshToken(user.id, tokens.refreshToken);
    await User.updateLastLogin(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens
    };
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      await User.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout user
  static async logout(userId) {
    await User.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  // Get user profile
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    const allowedFields = ['firstName', 'lastName', 'bio', 'profilePicture', 'dateOfBirth', 'phoneNumber'];
    const filteredData = {};

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await User.update(userId, filteredData);
    return this.sanitizeUser(user);
  }

  // Change password
  static async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await User.updatePassword(userId, newPassword);

    return { message: 'Password updated successfully' };
  }

  // Forgot password
  static async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await User.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // TODO: Send email with reset token
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Password reset email sent' };
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password and clear reset token
    await User.updatePassword(user.id, newPassword);
    await User.update(user.id, {
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return { message: 'Password reset successfully' };
  }

  // Verify email
  static async verifyEmail({activationCode}) {
    const user = await User.findByEmailVerificationCode(activationCode);
    if (!user) {
      throw new Error('Invalid verification token');
    }

    await User.verifyEmail(user.id);

    return { message: 'Email verified successfully' };
  }

  // Get all users (admin only)
  static async getAllUsers(options = {}) {
    const result = await User.findAll(options);
    
    return {
      users: result.users.map(user => this.sanitizeUser(user)),
      pagination: result.pagination
    };
  }

  // Get user by ID (admin only)
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  // Update user (admin only)
  static async updateUser(userId, updateData) {
    const user = await User.update(userId, updateData);
    return this.sanitizeUser(user);
  }

  // Delete user (admin only)
  static async deleteUser(userId) {
    const deleted = await User.delete(userId);
    if (!deleted) {
      throw new Error('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  // Get user statistics
  static async getUserStatistics() {
    return await User.getStatistics();
  }

  // Search users
  static async searchUsers(query, options = {}) {
    const searchOptions = {
      ...options,
      search: query
    };

    const result = await User.findAll(searchOptions);
    
    return {
      users: result.users.map(user => this.sanitizeUser(user)),
      pagination: result.pagination
    };
  }

  // Generate JWT tokens
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    };
  }

  // Remove sensitive data from user object
  static sanitizeUser(user) {
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.refreshToken;
    delete sanitized.passwordResetToken;
    delete sanitized.passwordResetExpires;
    delete sanitized.emailVerificationToken;
    return sanitized;
  }

  // Validate user data
  static validateUserData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.email) {
      if (!data.email || !this.isValidEmail(data.email)) {
        errors.push('Valid email is required');
      }
    }

    if (!isUpdate || data.password) {
      if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    if (!isUpdate || data.firstName) {
      if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || data.lastName) {
      if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    if (!isUpdate || data.username) {
      if (!data.username || data.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
    }

    return errors;
  }

  // Email validation helper
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user has permission
  static hasPermission(userRole, requiredRole) {
    const roleHierarchy = {
      'STUDENT': 1,
      'INSTRUCTOR': 2,
      'ADMIN': 3,
      'SUPER_ADMIN': 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // Get user dashboard data
  static async getDashboardData(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user statistics based on role
    let dashboardData = {
      user: this.sanitizeUser(user)
    };

    if (user.role === 'STUDENT') {
      // Get student-specific data
      const Progress = require('../models/Progress');
      dashboardData.statistics = await Progress.getUserStatistics(userId);
      dashboardData.recentActivity = await Progress.getRecentActivity(userId, 5);
    } else if (user.role === 'INSTRUCTOR') {
      // Get instructor-specific data
      const Course = require('../models/Course');
      const instructorCourses = await Course.findAll({ instructorId: userId, limit: 5 });
      dashboardData.courses = instructorCourses.courses;
      dashboardData.courseStatistics = await Course.getStatistics();
    } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      // Get admin-specific data
      dashboardData.userStatistics = await User.getStatistics();
      const Course = require('../models/Course');
      dashboardData.courseStatistics = await Course.getStatistics();
    }

    return dashboardData;
  }
}

module.exports = UserService;