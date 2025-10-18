const { executeQuery, getPaginatedResults } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const UserCodeService = require('../services/userCodeService'); 

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.firstName = data.first_name;
    this.lastName = data.last_name;
    this.avatar = data.avatar;
    this.profilePicture = data.profile_picture;
    this.dateOfBirth = data.date_of_birth;
    this.role = data.role;
    this.status = data.status;
    this.isActive = data.is_active;
    this.isEmailVerified = data.is_email_verified;
    this.emailVerifiedAt = data.email_verified_at;
    this.lastLoginAt = data.last_login_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.grade = data.grade;
    this.parentEmail = data.parent_email;
    this.preferences = data.preferences;
  }

  // Create new user
  static async create({
         email,
          username,
          password,
          firstName,
          lastName,
          role
         }) {


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const query = `
      INSERT INTO users (
        id, email, username, first_name, last_name, password, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(query, [
      id,
      email,
      username,
      firstName,
      lastName,
      hashedPassword,
      role
     
    ]);

    // Generate activation code
    
    await UserCodeService.genActivationCode({ id, email }); 


    return await User.findById(id);
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    return new User(results[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const results = await executeQuery(query, [email]);
    
    if (results.length === 0) {
      return null;
    }

    return new User(results[0]);
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const results = await executeQuery(query, [username]);

    console.log(username);

    if (results.length === 0) {
      return null;
    }

    return new User(results[0]);
  }

  // Get all users with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      status,
      search
    } = options;

    let whereConditions = [];
    let params = [];

    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseQuery = `
      SELECT id, email, username, first_name, last_name, avatar, profile_picture,
             date_of_birth, role, status, is_active, is_email_verified, 
             email_verified_at, last_login_at, created_at, updated_at, 
             grade, parent_email, preferences
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    return {
      users: result.data.map(user => new User(user)),
      pagination: result.pagination
    };
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = [
      'username', 'first_name', 'last_name', 'avatar', 'profile_picture',
      'date_of_birth', 'role', 'status', 'is_active', 'is_email_verified',
      'grade', 'parent_email', 'preferences'
    ];

    const updateFields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updateFields.push(`${dbField} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await User.findById(id);
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const query = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(query, [hashedPassword, id]);
    
    return await User.findById(id);
  }

  // Update refresh token
  static async updateRefreshToken(id, refreshToken) {
    const query = 'UPDATE users SET refresh_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(query, [refreshToken, id]);
  }

  // Update last login
  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(query, [id]);
  }

  // Verify email
  static async verifyEmail(id) {
    const query = `
      UPDATE users 
      SET is_email_verified = TRUE, email_verified_at = CURRENT_TIMESTAMP, 
          status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
    return await User.findById(id);
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Verify password
  async verifyPassword(password) {
    const query = 'SELECT password FROM users WHERE id = ?';
    const results = await executeQuery(query, [this.id]);
    
    if (results.length === 0) {
      return false;
    }

    return await bcrypt.compare(password, results[0].password);
  }

  // Get user statistics
  static async getStatistics() {
    const queries = [
      'SELECT COUNT(*) as total FROM users',
      'SELECT COUNT(*) as active FROM users WHERE status = "ACTIVE"',
      'SELECT COUNT(*) as students FROM users WHERE role = "STUDENT"',
      'SELECT COUNT(*) as instructors FROM users WHERE role = "INSTRUCTOR"',
      'SELECT COUNT(*) as verified FROM users WHERE is_email_verified = TRUE'
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query))
    );

    return {
      total: results[0][0].total,
      active: results[1][0].active,
      students: results[2][0].students,
      instructors: results[3][0].instructors,
      verified: results[4][0].verified
    };
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password, refreshToken, ...userData } = this;
    return userData;
  }
}

module.exports = User;