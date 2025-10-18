const express = require('express');
const { body, query, validationResult } = require('express-validator');
const QuizService = require('../services/quizService');
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

// Quiz validation rules
const quizValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('courseId').optional().notEmpty().withMessage('Course ID is required when provided'),
  body('lessonId').optional().notEmpty().withMessage('Lesson ID is required when provided'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('passingScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be a positive integer'),
  body('isRandomized').optional().isBoolean().withMessage('Is randomized must be a boolean'),
  body('showResults').optional().isBoolean().withMessage('Show results must be a boolean')
];

// Update quiz validation rules
const updateQuizValidation = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('timeLimit').optional().isInt({ min: 1 }).withMessage('Time limit must be a positive integer'),
  body('passingScore').optional().isFloat({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be a positive integer'),
  body('isRandomized').optional().isBoolean().withMessage('Is randomized must be a boolean'),
  body('showResults').optional().isBoolean().withMessage('Show results must be a boolean')
];

// Question validation rules
const questionValidation = [
  body('question').trim().isLength({ min: 5 }).withMessage('Question must be at least 5 characters long'),
  body('type').isIn(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']).withMessage('Invalid question type'),
  body('points').optional().isFloat({ min: 0 }).withMessage('Points must be non-negative'),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('options').optional().isArray().withMessage('Options must be an array'),
  body('correctAnswer').optional().notEmpty().withMessage('Correct answer is required when provided')
];

// Query validation rules
const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['title', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('courseId').optional().isInt({ min: 1 }).withMessage('Course ID must be a positive integer'),
  query('lessonId').optional().isInt({ min: 1 }).withMessage('Lesson ID must be a positive integer'),
  query('published').optional().isBoolean().withMessage('Published must be a boolean')
];

// @route   GET /api/quizzes
// @desc    Get all quizzes with pagination and filtering
// @access  Private
/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes with pagination and filtering
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: integer
 *         description: Filter by lesson ID
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
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
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', auth, queryValidation, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      courseId: req.query.courseId,
      lessonId: req.query.lessonId,
      published: req.query.published,
      userId: req.user.id
    };

    const result = await QuizService.getAllQuizzes(options);
    
    res.json({
      success: true,
      data: result.quizzes,
      pagination: {
        page: options.page,
        limit: options.limit,
        total: result.total,
        pages: Math.ceil(result.total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/course/:courseId
// @desc    Get quizzes by course ID
// @access  Private
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await QuizService.getQuizzesByCourse(courseId);
    
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

// @route   GET /api/quizzes/lesson/:lessonId
// @desc    Get quizzes by lesson ID
// @access  Private
router.get('/lesson/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const quizzes = await QuizService.getQuizzesByLesson(lessonId);
    
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

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 minLength: 10
 *               courseId:
 *                 type: integer
 *               lessonId:
 *                 type: integer
 *               timeLimit:
 *                 type: integer
 *                 minimum: 1
 *               passingScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               maxAttempts:
 *                 type: integer
 *                 minimum: 1
 *               isRandomized:
 *                 type: boolean
 *               showResults:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 */
router.post('/', auth, instructorAuth, quizValidation, handleValidationErrors, async (req, res) => {
  try {
    const quizData = { ...req.body, instructorId: req.user.id };
    const quiz = await QuizService.createQuiz(quizData);
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
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
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await QuizService.getQuizById(id);
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               title:
 *                 type: string
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 minLength: 10
 *               timeLimit:
 *                 type: integer
 *                 minimum: 1
 *               passingScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               maxAttempts:
 *                 type: integer
 *                 minimum: 1
 *               isRandomized:
 *                 type: boolean
 *               showResults:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not quiz owner
 *       404:
 *         description: Quiz not found
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await QuizService.updateQuiz(id, req.body);
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not quiz owner
 *       404:
 *         description: Quiz not found
 */
router.delete('/:id', auth, instructorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await QuizService.deleteQuiz(id);
    
    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *       400:
 *         description: Invalid submission
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const result = await QuizService.submitQuiz(id, req.user.id, answers);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/:id/results
// @desc    Get quiz results
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}/results:
 *   get:
 *     summary: Get quiz results
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz results retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/results', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await QuizService.getQuizResults(id, req.user.id);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/:id/attempts
// @desc    Get quiz attempts
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}/attempts:
 *   get:
 *     summary: Get quiz attempts
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/attempts', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const attempts = await QuizService.getQuizAttempts(id, req.user.id);
    
    res.json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/quizzes/:id/reset
// @desc    Reset quiz attempts
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}/reset:
 *   post:
 *     summary: Reset quiz attempts
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz attempts reset successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/reset', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await QuizService.resetQuizAttempts(id, req.user.id);
    
    res.json({
      success: true,
      message: 'Quiz attempts reset successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/:id/analytics
// @desc    Get quiz analytics
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/analytics:
 *   get:
 *     summary: Get quiz analytics
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await QuizService.getQuizAnalytics(id);
    
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

// @route   GET /api/quizzes/:id/questions
// @desc    Get quiz questions
// @access  Private
/**
 * @swagger
 * /api/quizzes/{id}/questions:
 *   get:
 *     summary: Get quiz questions
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz questions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.get('/:id/questions', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await QuizService.getQuizQuestions(id);
    
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/quizzes/:id/questions
// @desc    Add question to quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/questions:
 *   post:
 *     summary: Add question to quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - question
 *               - type
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 5
 *               type:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY]
 *               points:
 *                 type: number
 *                 minimum: 0
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               options:
 *                 type: array
 *               correctAnswer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/questions', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const question = await QuizService.addQuestionToQuiz(id, req.body);
    
    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/quizzes/:id/questions/:questionId
// @desc    Update quiz question
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/questions/{questionId}:
 *   put:
 *     summary: Update quiz question
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 minLength: 5
 *               type:
 *                 type: string
 *                 enum: [MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY]
 *               points:
 *                 type: number
 *                 minimum: 0
 *               order:
 *                 type: integer
 *                 minimum: 1
 *               options:
 *                 type: array
 *               correctAnswer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Question not found
 */
router.put('/:id/questions/:questionId', auth, async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const question = await QuizService.updateQuizQuestion(id, questionId, req.body);
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/quizzes/:id/questions/:questionId
// @desc    Delete quiz question
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/questions/{questionId}:
 *   delete:
 *     summary: Delete quiz question
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Question not found
 */
router.delete('/:id/questions/:questionId', auth, async (req, res) => {
  try {
    const { id, questionId } = req.params;
    await QuizService.deleteQuizQuestion(id, questionId);
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/quizzes/:id/publish
// @desc    Publish quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/publish:
 *   post:
 *     summary: Publish quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await QuizService.updateQuiz(id, { published: true });
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/quizzes/:id/unpublish
// @desc    Unpublish quiz
// @access  Private/Instructor
/**
 * @swagger
 * /api/quizzes/{id}/unpublish:
 *   post:
 *     summary: Unpublish a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz unpublished successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor role required
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/unpublish', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await QuizService.updateQuiz(id, { published: false });
    
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quizzes/search
// @desc    Search quizzes
// @access  Private
/**
 * @swagger
 * /api/quizzes/search:
 *   get:
 *     summary: Search quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, limit = 10, courseId } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const quizzes = await QuizService.searchQuizzes(query, { 
      limit: parseInt(limit),
      courseId,
      userId: req.user.id
    });
    
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;