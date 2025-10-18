const express = require('express');
const router = express.Router();
const database = require('../database/mysql-database');
const { requireSuperAdmin } = require('../middleware/auth');

// Test database connection
router.get('/database', async (req, res) => {
  try {
    const result = await database.query('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test CRUD operations for users
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const users = await database.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Test CRUD operations for categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await database.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Test CRUD operations for courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await database.query(`
      SELECT c.*, cat.name as category_name 
      FROM courses c 
      LEFT JOIN course_categories cc ON c.id = cc.course_id 
      LEFT JOIN categories cat ON cc.category_id = cat.id 
      ORDER BY c.created_at DESC 
      LIMIT 10
    `);
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// Test CRUD operations for lessons
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await database.query(`
      SELECT l.*, c.title as course_title 
      FROM lessons l 
      LEFT JOIN courses c ON l.course_id = c.id 
      ORDER BY l.created_at DESC 
      LIMIT 10
    `);
    res.json({
      success: true,
      data: lessons,
      count: lessons.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons',
      error: error.message
    });
  }
});

// Test user creation
router.post('/users', requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    // Check if user already exists
    const existingUser = await database.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await database.query(
      'INSERT INTO users (email, first_name, last_name, password, role) VALUES (?, ?, ?, ?, ?)',
      [email, firstName, lastName, hashedPassword, role]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      userId: result.lastID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Test user update
router.put('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role } = req.body;

    const result = await database.query(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, role = ? WHERE id = ?',
      [email, firstName, lastName, role, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Test user deletion
router.delete('/users/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists and is not super admin
    const user = await database.query('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].role === 'SUPER_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete super admin user'
      });
    }

    const result = await database.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Test category creation
router.post('/categories', requireSuperAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await database.query('SELECT id FROM categories WHERE name = ?', [name]);

    const result = await database.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.json({
      success: true,
      message: 'Category created successfully',
      categoryId: result.lastID
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// Test category update
router.put('/categories/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await database.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// Test category deletion
router.delete('/categories/:id', requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has courses
    const courses = await database.query('SELECT COUNT(*) as count FROM courses WHERE category_id = ?', [id]);
    if (courses[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing courses'
      });
    }

    const result = await database.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {};
    
    // Count users by role
    const userStats = await database.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    stats.users = userStats.reduce((acc, row) => {
      acc[row.role] = row.count;
      return acc;
    }, {});

    // Count categories
    const categoryCount = await database.query('SELECT COUNT(*) as count FROM categories');
    stats.categories = categoryCount[0].count;

    // Count courses
    const courseCount = await database.query('SELECT COUNT(*) as count FROM courses');
    stats.courses = courseCount[0].count;

    // Count lessons
    const lessonCount = await database.query('SELECT COUNT(*) as count FROM lessons');
    stats.lessons = lessonCount[0].count;

    // Count enrollments
    const enrollmentCount = await database.query('SELECT COUNT(*) as count FROM enrollments');
    stats.enrollments = enrollmentCount[0].count;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error.message
    });
  }
});

module.exports = router;