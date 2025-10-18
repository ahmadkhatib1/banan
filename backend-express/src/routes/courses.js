const express = require('express');
const { body, query, validationResult } = require('express-validator');
const CourseService = require('../services/courseService');
const { auth } = require('../middleware/auth');
const instructorAuth = require('../middleware/instructorAuth');
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

// Course validation rules
const courseValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid level'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryIds').optional().isArray().withMessage('Category IDs must be an array')
];

// Update course validation rules
const updateCourseValidation = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid level'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('categoryIds').optional().isArray().withMessage('Category IDs must be an array')
];

// Query validation rules
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).withMessage('Invalid level filter'),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status filter')
];

// Rating validation rules
const ratingValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
];

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         description: Filter by course level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           default: PUBLISHED
 *         description: Filter by course status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *         description: Filter by instructor
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', queryValidation, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      level: req.query.level,
      status: req.query.status || 'PUBLISHED',
      search: req.query.search,
      category: req.query.category,
      instructor: req.query.instructor,
      creator: req.query.creator,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
    };

    const result = await CourseService.getAllCourses(options);
    
    res.json({
      success: true,
      data: result.courses,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCourses: result.totalCourses,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/courses/popular:
 *   get:
 *     summary: Get popular courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Popular courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const courses = await CourseService.getPopularCourses(limit);
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/courses/search:
 *   get:
 *     summary: Search courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for course title or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of search results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       400:
 *         description: Search query is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const courses = await CourseService.searchCourses(query, { 
      limit: parseInt(limit),
      status: 'PUBLISHED'
    });
    
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     summary: Get user's created courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         description: Filter by course status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User's courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Instructor role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-courses', auth, instructorAuth, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status,
      search: req.query.search,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await CourseService.getInstructorCourses(req.user.id, options);
    
    res.json({
      success: true,
      data: result.courses,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCourses: result.totalCourses,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - level
 *               - category
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Introduction to JavaScript"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: "Learn the fundamentals of JavaScript programming"
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *                 example: "BEGINNER"
 *               category:
 *                 type: string
 *                 example: "Programming"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 99.99
 *               thumbnail:
 *                 type: string
 *                 example: "https://example.com/thumbnail.jpg"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["javascript", "programming", "web-development"]
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Course created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Instructor role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth, instructorAuth, courseValidation, handleValidationErrors, async (req, res) => {
  try {
    const course = await CourseService.createCourse(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional user ID for enrolled status
    
    const course = await CourseService.getCourseById(id, userId);
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Instructor
router.put('/:id', auth, instructorAuth, updateCourseValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseService.updateCourse(id, req.body, req.user.id);
    
    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private/Instructor
router.delete('/:id', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await CourseService.deleteCourse(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await CourseService.enrollUser(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Enrolled in course successfully',
      data: enrollment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/courses/:id/unenroll
// @desc    Unenroll from course
// @access  Private
router.post('/:id/unenroll', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await CourseService.unenrollUser(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Unenrolled from course successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/courses/:id/lessons
// @desc    Get course lessons
// @access  Public
router.get('/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const lessons = await CourseService.getCourseLessons(id, userId);
    
    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/courses/:id/quizzes
// @desc    Get course quizzes
// @access  Public
router.get('/:id/quizzes', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const quizzes = await CourseService.getCourseQuizzes(id, userId);
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/courses/:id/rate
// @desc    Rate course
// @access  Private
router.post('/:id/rate', auth, ratingValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const result = await CourseService.rateCourse(id, req.user.id, rating, comment);
    
    res.json({
      success: true,
      message: 'Course rated successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/courses/:id/ratings
// @desc    Get course ratings
// @access  Public
router.get('/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };
    
    const ratings = await CourseService.getCourseRatings(id, options);
    
    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/courses/:id/publish
// @desc    Publish course
// @access  Private/Instructor
router.put('/:id/publish', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseService.publishCourse(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Course published successfully',
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/courses/:id/unpublish
// @desc    Unpublish course
// @access  Private/Instructor
router.put('/:id/unpublish', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseService.unpublishCourse(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Course unpublished successfully',
      data: course
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/courses/:id/students
// @desc    Get course students (Instructor only)
// @access  Private/Instructor
router.get('/:id/students', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search,
      sortBy: req.query.sortBy || 'enrolledAt',
      sortOrder: req.query.sortOrder || 'desc'
    };
    
    const students = await CourseService.getCourseStudents(id, req.user.id, options);
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/courses/:id/analytics
// @desc    Get course analytics (Instructor only)
// @access  Private/Instructor
router.get('/:id/analytics', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await CourseService.getCourseAnalytics(id, req.user.id);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/courses/:id/categories
// @desc    Add categories to course
// @access  Private/Instructor
router.post('/:id/categories', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Category IDs array is required'
      });
    }
    
    await CourseService.addCourseCategories(id, categoryIds, req.user.id);
    
    res.json({
      success: true,
      message: 'Categories added to course successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/courses/:id/categories/:categoryId
// @desc    Remove category from course
// @access  Private/Instructor
router.delete('/:id/categories/:categoryId', auth, instructorAuth, async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    
    await CourseService.removeCourseCategory(id, categoryId, req.user.id);
    
    res.json({
      success: true,
      message: 'Category removed from course successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;