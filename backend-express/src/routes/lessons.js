const express = require('express');
const { body, query, validationResult } = require('express-validator');
const LessonService = require('../services/lessonService');
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

// Lesson validation rules
const lessonValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('type').isIn(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).withMessage('Invalid lesson type'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('videoDuration').optional().isInt({ min: 0 }).withMessage('Video duration must be non-negative')
];

// Update lesson validation rules
const updateLessonValidation = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('type').optional().isIn(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).withMessage('Invalid lesson type'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('videoDuration').optional().isInt({ min: 0 }).withMessage('Video duration must be non-negative')
];

// Progress validation rules
const progressValidation = [
  body('completionPercentage').isFloat({ min: 0, max: 100 }).withMessage('Completion percentage must be between 0 and 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
];

// Query validation rules
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']).withMessage('Invalid type filter'),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED']).withMessage('Invalid status filter')
];

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
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
 *         description: Number of lessons per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [VIDEO, TEXT, QUIZ, ASSIGNMENT]
 *         description: Filter by lesson type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *         description: Filter by lesson status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search lessons by title or description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: order
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
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
 *                     $ref: '#/components/schemas/Lesson'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalLessons:
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
 *       401:
 *         description: Unauthorized - Authentication required
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
router.get('/', auth, queryValidation, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      courseId: req.query.courseId,
      type: req.query.type,
      status: req.query.status,
      search: req.query.search,
      userId: req.user.id,
      sortBy: req.query.sortBy || 'order',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const result = await LessonService.getAllLessons(options);
    
    res.json({
      success: true,
      data: result.lessons,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalLessons: result.totalLessons,
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
 * /api/lessons/course/{courseId}:
 *   get:
 *     summary: Get lessons by course ID
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to get lessons for
 *     responses:
 *       200:
 *         description: Course lessons retrieved successfully
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
 *                     $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await LessonService.getLessonsByCourse(courseId, req.user.id);
    
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

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create new lesson
 *     tags: [Lessons]
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
 *               - courseId
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 example: "Introduction to Variables"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Learn about variables in programming"
 *               courseId:
 *                 type: string
 *                 example: "course123"
 *               type:
 *                 type: string
 *                 enum: [VIDEO, TEXT, QUIZ, ASSIGNMENT]
 *                 example: "VIDEO"
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               videoDuration:
 *                 type: integer
 *                 minimum: 0
 *                 example: 600
 *               content:
 *                 type: string
 *                 example: "Lesson content here"
 *     responses:
 *       201:
 *         description: Lesson created successfully
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
 *                   example: "Lesson created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
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
router.post('/', auth, instructorAuth, lessonValidation, handleValidationErrors, async (req, res) => {
  try {
    const lesson = await LessonService.createLesson(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
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
 * /api/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson not found
 */
router.get('/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const lesson = await LessonService.getLessonById(id, req.user.id);
    
    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not course instructor
 *       404:
 *         description: Lesson not found
 */
router.put('/:id', auth, instructorAuth, updateLessonValidation, handleValidationErrors, async (req, res) => {

  try {
    const { id } = req.params;
    const lesson = await LessonService.updateLesson(id, req.body, req.user.id);
    
    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
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
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not course instructor
 *       404:
 *         description: Lesson not found
 */
router.delete('/:id', auth, instructorAuth, async (req, res) => {

  try {
    const { id } = req.params;
    await LessonService.deleteLesson(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Lesson deleted successfully'
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
 * /api/lessons/{id}/complete:
 *   post:
 *     summary: Mark lesson as completed
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson marked as completed
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
 *                   example: Lesson completed successfully
 *       400:
 *         description: Already completed or not enrolled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/:id/complete', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const { timeSpent = 0 } = req.body;
    
    const result = await LessonService.markCompleted(id, req.user.id, timeSpent);
    
    res.json({
      success: true,
      message: 'Lesson marked as completed',
      data: result
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
 * /api/lessons/{id}/progress:
 *   post:
 *     summary: Update lesson progress
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Progress percentage
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Invalid progress value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/:id/progress', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const progress = await LessonService.updateProgress(id, req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
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
 * /api/lessons/{id}/notes:
 *   get:
 *     summary: Get lesson notes
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson notes retrieved successfully
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
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.get('/:id/notes', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/notes:
 *   post:
 *     summary: Add lesson note
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Note content
 *               timestamp:
 *                 type: number
 *                 description: Video timestamp in seconds
 *     responses:
 *       201:
 *         description: Note added successfully
 *       400:
 *         description: Invalid note data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/:id/notes', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/notes/{noteId}:
 *   put:
 *     summary: Update lesson note
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Note content
 *               timestamp:
 *                 type: number
 *                 description: Video timestamp in seconds
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not note owner
 *       404:
 *         description: Note not found
 */
router.put('/:id/notes/:noteId', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/notes/{noteId}:
 *   delete:
 *     summary: Delete lesson note
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not note owner
 *       404:
 *         description: Note not found
 */
router.delete('/:id/notes/:noteId', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/comments:
 *   get:
 *     summary: Get lesson comments
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson comments retrieved successfully
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
 *                     type: object
 *       404:
 *         description: Lesson not found
 */
router.get('/:id/comments', async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/comments:
 *   post:
 *     summary: Add lesson comment
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Invalid comment data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.post('/:id/comments', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/comments/{commentId}:
 *   put:
 *     summary: Update lesson comment
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not comment owner
 *       404:
 *         description: Comment not found
 */
router.put('/:id/comments/:commentId', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/lessons/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete lesson comment
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not comment owner
 *       404:
 *         description: Comment not found
 */
router.delete('/:id/comments/:commentId', auth, async (req, res) => {

  try {
    const { id } = req.params;
    const resources = await LessonService.getLessonResources(id, req.user.id);
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;