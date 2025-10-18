const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../database/mysql-database');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Create first admin validation rules
const createFirstAdminValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
];

// Create admin validation rules
const createAdminValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('role').isIn(['CONTENT_ADMIN', 'SUPER_ADMIN']).withMessage('Invalid role')
];

/**
 * @swagger
 * /api/admin/setup-first-admin:
 *   post:
 *     summary: Create the first admin account
 *     description: Creates the first super admin account if no admin exists
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               username:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       201:
 *         description: First admin created successfully
 *       400:
 *         description: Validation error or admin already exists
 *       500:
 *         description: Server error
 */
router.post('/setup-first-admin', createFirstAdminValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Check if any admin already exists
    const existingAdmins = await database.query(
      `SELECT COUNT(*) as count FROM users WHERE role IN ('SUPER_ADMIN', 'CONTENT_ADMIN')`
    );

    if (existingAdmins[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists. Use the regular admin creation endpoint.'
      });
    }

    // Check if email or username already exists
    const existingUser = await database.query(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create first admin
    const result = await database.query(
      `INSERT INTO users (email, username, first_name, last_name, password, role, status, is_active, is_email_verified, email_verified_at)
       VALUES (?, ?, ?, ?, ?, 'SUPER_ADMIN', 'ACTIVE', 1, 1, CURRENT_TIMESTAMP)`,
      [email, username, firstName, lastName, hashedPassword]
    );

    // Get the created admin
    const newAdmin = await database.query(
      `SELECT id, email, username, first_name, last_name, role, status, created_at FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'First admin account created successfully',
      data: {
        admin: newAdmin[0]
      }
    });

  } catch (error) {
    console.error('Error creating first admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating first admin account'
    });
  }
});

/**
 * @swagger
 * /api/admin/check-setup:
 *   get:
 *     summary: Check if admin setup is required
 *     description: Checks if any admin account exists in the system
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Setup status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 setupRequired:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/check-setup', async (req, res) => {
  try {
    const existingAdmins = await database.query(
      `SELECT COUNT(*) as count FROM users WHERE role IN ('SUPER_ADMIN', 'CONTENT_ADMIN')`
    );

    const setupRequired = existingAdmins[0].count === 0;

    res.json({
      success: true,
      setupRequired,
      message: setupRequired ? 'Admin setup is required' : 'Admin account exists'
    });

  } catch (error) {
    console.error('Error checking admin setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking admin setup status'
    });
  }
});

/**
 * @swagger
 * /api/admin/create-admin:
 *   post:
 *     summary: Create a new admin account
 *     description: Creates a new admin account (requires SUPER_ADMIN role)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - username
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               username:
 *                 type: string
 *                 minLength: 3
 *               role:
 *                 type: string
 *                 enum: [CONTENT_ADMIN, SUPER_ADMIN]
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires SUPER_ADMIN role
 *       500:
 *         description: Server error
 */
router.post('/create-admin', auth, requireRole(['SUPER_ADMIN']), createAdminValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, firstName, lastName, username, role } = req.body;

    // Check if email or username already exists
    const existingUser = await database.query(
      `SELECT id FROM users WHERE email = ? OR username = ?`,
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const result = await database.query(
      `INSERT INTO users (email, username, first_name, last_name, password, role, status, is_active, is_email_verified, email_verified_at)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 1, 1, CURRENT_TIMESTAMP)`,
      [email, username, firstName, lastName, hashedPassword, role]
    );

    // Get the created admin
    const newAdmin = await database.query(
      `SELECT id, email, username, first_name, last_name, role, status, created_at FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        admin: newAdmin[0]
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin account'
    });
  }
});

/**
 * @swagger
 * /api/admin/admins:
 *   get:
 *     summary: Get all admin accounts
 *     description: Retrieves all admin accounts (requires SUPER_ADMIN role)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin accounts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires SUPER_ADMIN role
 *       500:
 *         description: Server error
 */
router.get('/admins', auth, requireRole(['SUPER_ADMIN']), async (req, res) => {
  try {
    const admins = await database.query(
      `SELECT id, email, username, first_name, last_name, role, status, is_active, created_at, last_login_at 
       FROM users WHERE role IN ('SUPER_ADMIN', 'CONTENT_ADMIN') 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: {
        admins,
        total: admins.length
      }
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin accounts'
    });
  }
});

module.exports = router;