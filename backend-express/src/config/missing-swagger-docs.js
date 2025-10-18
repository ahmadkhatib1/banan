/**
 * Missing Swagger Documentation for All Endpoints
 * This file contains all the missing Swagger documentation that needs to be added to route files
 */

// COURSES.JS MISSING ENDPOINTS (14 endpoints)
const coursesMissingDocs = `
/**
 * @swagger
 * /api/courses/popular:
 *   get:
 *     summary: Get popular courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Popular courses retrieved successfully
 */

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
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 *   put:
 *     summary: Update course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course updated successfully
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted successfully

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Enrolled successfully

/**
 * @swagger
 * /api/courses/{id}/unenroll:
 *   post:
 *     summary: Unenroll from course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unenrolled successfully

/**
 * @swagger
 * /api/courses/{id}/lessons:
 *   get:
 *     summary: Get course lessons
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course lessons retrieved successfully

/**
 * @swagger
 * /api/courses/{id}/quizzes:
 *   get:
 *     summary: Get course quizzes
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course quizzes retrieved successfully

/**
 * @swagger
 * /api/courses/{id}/rate:
 *   post:
 *     summary: Rate course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course rated successfully

/**
 * @swagger
 * /api/courses/{id}/ratings:
 *   get:
 *     summary: Get course ratings
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course ratings retrieved successfully

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   put:
 *     summary: Publish course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course published successfully

/**
 * @swagger
 * /api/courses/{id}/unpublish:
 *   put:
 *     summary: Unpublish course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course unpublished successfully

/**
 * @swagger
 * /api/courses/{id}/students:
 *   get:
 *     summary: Get course students
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course students retrieved successfully

/**
 * @swagger
 * /api/courses/{id}/analytics:
 *   get:
 *     summary: Get course analytics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course analytics retrieved successfully

/**
 * @swagger
 * /api/courses/{id}/categories:
 *   post:
 *     summary: Add course categories
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categories added successfully

/**
 * @swagger
 * /api/courses/{id}/categories/{categoryId}:
 *   delete:
 *     summary: Remove course category
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category removed successfully
`;

// LESSONS.JS MISSING ENDPOINTS (15 endpoints)
const lessonsMissingDocs = `
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
 *           type: integer
 *     responses:
 *       200:
 *         description: Course lessons retrieved successfully

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
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
 *     responses:
 *       200:
 *         description: Lesson updated successfully
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
 *     responses:
 *       200:
 *         description: Lesson deleted successfully

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
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *   get:
 *     summary: Get lesson progress
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Progress retrieved successfully

/**
 * @swagger
 * /api/lessons/{id}/complete:
 *   post:
 *     summary: Mark lesson as complete
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson marked as complete

/**
 * @swagger
 * /api/lessons/{id}/next:
 *   get:
 *     summary: Get next lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Next lesson retrieved successfully

/**
 * @swagger
 * /api/lessons/{id}/previous:
 *   get:
 *     summary: Get previous lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Previous lesson retrieved successfully

/**
 * @swagger
 * /api/lessons/course/{courseId}/current:
 *   get:
 *     summary: Get current lesson for course
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Current lesson retrieved successfully

/**
 * @swagger
 * /api/lessons/course/{courseId}/reorder:
 *   put:
 *     summary: Reorder course lessons
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lessons reordered successfully

/**
 * @swagger
 * /api/lessons/statistics:
 *   get:
 *     summary: Get lesson statistics
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully

/**
 * @swagger
 * /api/lessons/{id}/completion-rate:
 *   get:
 *     summary: Get lesson completion rate
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Completion rate retrieved successfully

/**
 * @swagger
 * /api/lessons/search:
 *   get:
 *     summary: Search lessons
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully

/**
 * @swagger
 * /api/lessons/{id}/resources:
 *   get:
 *     summary: Get lesson resources
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *   put:
 *     summary: Update lesson resources
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resources updated successfully

/**
 * @swagger
 * /api/lessons/{id}/can-access:
 *   get:
 *     summary: Check if user can access lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Access check completed successfully
`;

module.exports = {
  coursesMissingDocs,
  lessonsMissingDocs
};