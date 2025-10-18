const express = require('express');
const { body, query, validationResult } = require('express-validator');
const ProgressService = require('../services/progressService');
const { auth } = require('../middleware/auth');
const instructorAuth = require('../middleware/instructorAuth');
const adminAuth = require('../middleware/adminAuth');
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

// Progress validation rules
const progressValidation = [
  body('lessonId').notEmpty().withMessage('Lesson ID is required'),
  body('completionPercentage').isFloat({ min: 0, max: 100 }).withMessage('Completion percentage must be between 0 and 100'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
];

// Bulk progress validation rules
const bulkProgressValidation = [
  body('progressData').isArray({ min: 1 }).withMessage('Progress data array is required'),
  body('progressData.*.lessonId').notEmpty().withMessage('Lesson ID is required for each progress entry'),
  body('progressData.*.completionPercentage').isFloat({ min: 0, max: 100 }).withMessage('Completion percentage must be between 0 and 100'),
  body('progressData.*.timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
];

// Query validation rules
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
];

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get user's progress
 *     tags: [Progress]
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
 *           default: 20
 *         description: Number of progress records per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter progress by course ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter progress from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter progress until this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: updatedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
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
 *                     $ref: '#/components/schemas/Progress'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalProgress:
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
      limit: parseInt(req.query.limit) || 20,
      courseId: req.query.courseId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'updatedAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await ProgressService.getUserProgress(req.user.id, options);
    
    res.json({
      success: true,
      data: result.progress,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalProgress: result.totalProgress,
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
 * /api/progress:
 *   post:
 *     summary: Update lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - completionPercentage
 *             properties:
 *               lessonId:
 *                 type: string
 *                 example: "lesson123"
 *               completionPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75.5
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1800
 *                 description: Time spent in seconds
 *     responses:
 *       200:
 *         description: Progress updated successfully
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
 *                   example: "Progress updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Progress'
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
router.post('/', auth, progressValidation, handleValidationErrors, async (req, res) => {
  try {
    const { lessonId, completionPercentage, timeSpent = 0 } = req.body;
    
    const progress = await ProgressService.updateProgress(
      req.user.id,
      lessonId,
      completionPercentage,
      timeSpent
    );
    
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

// @route   POST /api/progress/complete
// @desc    Mark lesson as completed
// @access  Private
router.post('/complete', auth, async (req, res) => {
  try {
    const { lessonId, timeSpent = 0 } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }
    
    const result = await ProgressService.markCompleted(req.user.id, lessonId, timeSpent);
    
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

// @route   GET /api/progress/lesson/:lessonId
// @desc    Get progress for specific lesson
// @access  Private
router.get('/lesson/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const progress = await ProgressService.getLessonProgress(req.user.id, lessonId);
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/course/:courseId
// @desc    Get progress for specific course
// @access  Private
/**
 * @swagger
 * /api/progress/course/{courseId}:
 *   get:
 *     summary: Get course progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get('/course/:courseId', auth, async (req, res) => {
   try {
     const { courseId } = req.params;
     const progress = await ProgressService.getCourseProgress(req.user.id, courseId);
     
     res.json({
       success: true,
       data: progress
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
 * /api/progress/lesson/{lessonId}:
 *   get:
 *     summary: Get lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/progress/lesson/{lessonId}:
 *   post:
 *     summary: Update lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
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
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               timeSpent:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       400:
 *         description: Invalid progress data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/progress/lesson/{lessonId}/complete:
 *   post:
 *     summary: Mark lesson as completed
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
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

/**
 * @swagger
 * /api/progress/lesson/{lessonId}/uncomplete:
 *   post:
 *     summary: Mark lesson as uncompleted
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson marked as uncompleted
 *       400:
 *         description: Not completed or not enrolled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/progress/quiz/{quizId}:
 *   get:
 *     summary: Get quiz progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz progress retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/progress/quiz/{quizId}:
 *   post:
 *     summary: Update quiz progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz progress updated successfully
 *       400:
 *         description: Invalid quiz data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/progress/quiz/{quizId}/complete:
 *   post:
 *     summary: Mark quiz as completed
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz completed successfully
 *       400:
 *         description: Invalid quiz data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/progress/course/{courseId}/reset:
 *   post:
 *     summary: Reset course progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course progress reset successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/progress/lesson/{lessonId}/reset:
 *   post:
 *     summary: Reset lesson progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson progress reset successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/progress/analytics:
 *   get:
 *     summary: Get progress analytics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Progress analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/leaderboard:
 *   get:
 *     summary: Get progress leaderboard
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users to return
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
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
 */

/**
 * @swagger
 * /api/progress/streak:
 *   get:
 *     summary: Get user learning streak
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learning streak retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentStreak:
 *                       type: integer
 *                     longestStreak:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/achievements:
 *   get:
 *     summary: Get user achievements
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements retrieved successfully
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
 */

/**
 * @swagger
 * /api/progress/certificates:
 *   get:
 *     summary: Get user certificates
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
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
 */

/**
 * @swagger
 * /api/progress/course/{courseId}/certificate:
 *   get:
 *     summary: Get course certificate
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Certificate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certificate not found
 */

/**
 * @swagger
 * /api/progress/course/{courseId}/certificate:
 *   post:
 *     summary: Generate course certificate
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *     responses:
 *       201:
 *         description: Certificate generated successfully
 *       400:
 *         description: Course not completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/progress/export:
 *   get:
 *     summary: Export progress data
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *     responses:
 *       200:
 *         description: Progress data exported successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/progress/summary:
 *   get:
 *     summary: Get progress summary
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: integer
 *                     completedCourses:
 *                       type: integer
 *                     totalLessons:
 *                       type: integer
 *                     completedLessons:
 *                       type: integer
 *                     totalTimeSpent:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

// @route   GET /api/progress/course/:courseId/summary
// @desc    Get course progress summary
// @access  Private
router.get('/course/:courseId/summary', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const summary = await ProgressService.getCourseProgressSummary(req.user.id, courseId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/statistics
// @desc    Get user learning statistics
// @access  Private
router.get('/statistics', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    const stats = await ProgressService.getUserLearningStats(req.user.id, timeframe);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/recent-activity
// @desc    Get user's recent learning activity
// @access  Private
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const activity = await ProgressService.getRecentActivity(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/leaderboard
// @desc    Get progress leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { courseId, timeframe = '30d', limit = 10 } = req.query;
    const leaderboard = await ProgressService.getLeaderboard(courseId, timeframe, parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/course/:courseId/next-lesson
// @desc    Get next lesson for user in course
// @access  Private
router.get('/course/:courseId/next-lesson', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const nextLesson = await ProgressService.getNextLesson(req.user.id, courseId);
    
    res.json({
      success: true,
      data: nextLesson
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/course/:courseId/completed
// @desc    Check if user completed course
// @access  Private
router.get('/course/:courseId/completed', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const isCompleted = await ProgressService.isCourseCompleted(req.user.id, courseId);
    
    res.json({
      success: true,
      data: { isCompleted }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/lesson/:lessonId
// @desc    Delete progress for specific lesson
// @access  Private
router.delete('/lesson/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    await ProgressService.deleteProgress(req.user.id, lessonId);
    
    res.json({
      success: true,
      message: 'Progress deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/course/:courseId
// @desc    Reset progress for entire course
// @access  Private
router.delete('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    await ProgressService.resetCourseProgress(req.user.id, courseId);
    
    res.json({
      success: true,
      message: 'Course progress reset successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/progress/bulk
// @desc    Bulk update progress
// @access  Private
router.post('/bulk', auth, bulkProgressValidation, handleValidationErrors, async (req, res) => {
  try {
    const { progressData } = req.body;
    const results = await ProgressService.bulkUpdateProgress(req.user.id, progressData);
    
    res.json({
      success: true,
      message: 'Bulk progress update completed',
      data: results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/learning-path
// @desc    Get user's learning path
// @access  Private
router.get('/learning-path', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const learningPath = await ProgressService.getUserLearningPath(req.user.id, courseId);
    
    res.json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/trends
// @desc    Get progress trends
// @access  Private
router.get('/trends', auth, async (req, res) => {
  try {
    const { courseId, timeframe = '30d' } = req.query;
    const trends = await ProgressService.getProgressTrends(req.user.id, courseId, timeframe);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Instructor/Admin routes

// @route   GET /api/progress/analytics/course/:courseId
// @desc    Get course progress analytics (Instructor/Admin)
// @access  Private/Instructor
router.get('/analytics/course/:courseId', auth, instructorAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const analytics = await ProgressService.getCourseProgressAnalytics(courseId, req.user.id, timeframe);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/analytics/lesson/:lessonId
// @desc    Get lesson progress analytics (Instructor/Admin)
// @access  Private/Instructor
router.get('/analytics/lesson/:lessonId', auth, instructorAuth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const analytics = await ProgressService.getLessonProgressAnalytics(lessonId, req.user.id);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/course/:courseId/students
// @desc    Get student progress for course (Instructor/Admin)
// @access  Private/Instructor
router.get('/course/:courseId/students', auth, instructorAuth, queryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { courseId } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'completionPercentage',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await ProgressService.getStudentProgressForCourse(courseId, req.user.id, options);
    
    res.json({
      success: true,
      data: result.students,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalStudents: result.totalStudents,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/engagement/course/:courseId
// @desc    Get course engagement metrics (Instructor/Admin)
// @access  Private/Instructor
router.get('/engagement/course/:courseId', auth, instructorAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeframe = '30d' } = req.query;
    
    const engagement = await ProgressService.getCourseEngagementMetrics(courseId, req.user.id, timeframe);
    
    res.json({
      success: true,
      data: engagement
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/user/:userId
// @desc    Get specific user's progress (Admin only)
// @access  Private/Admin
router.get('/user/:userId', auth, adminAuth, queryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      courseId: req.query.courseId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'updatedAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await ProgressService.getUserProgress(userId, options);
    
    res.json({
      success: true,
      data: result.progress,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalProgress: result.totalProgress,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/user/:userId/course/:courseId
// @desc    Reset user's course progress (Admin only)
// @access  Private/Admin
router.delete('/user/:userId/course/:courseId', auth, adminAuth, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    await ProgressService.resetCourseProgress(userId, courseId);
    
    res.json({
      success: true,
      message: 'User course progress reset successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;