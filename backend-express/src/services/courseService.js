const Course = require('../models/Course');
const User = require('../models/User');
const { executeQuery } = require('../config/database');

class CourseService {
  // Create new course
  static async createCourse(courseData, creatorId) {
    const validationErrors = this.validateCourseData(courseData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const course = await Course.create({
      ...courseData,
      creatorId,
      instructorId: courseData.instructorId || creatorId
    });

    // Add categories if provided
    if (courseData.categoryIds && courseData.categoryIds.length > 0) {
      for (const categoryId of courseData.categoryIds) {
        await Course.addCategory(course.id, categoryId);
      }
    }

    return await Course.findById(course.id, true);
  }

  // Get course by ID
  static async getCourseById(courseId, userId = null) {
    const course = await Course.findById(courseId, true);
    if (!course) {
      throw new Error('Course not found');
    }

    // Add categories
    course.categories = await Course.getCategories(courseId);

    // Check if user is enrolled (if userId provided)
    if (userId) {
      course.isEnrolled = await Course.isUserEnrolled(courseId, userId);
      
      // Get user progress if enrolled
      if (course.isEnrolled) {
        const Progress = require('../models/Progress');
        course.userProgress = await Progress.getCourseSummary(userId, courseId);
      }
    }

    return course;
  }

  // Get all courses with filters
  static async getAllCourses(options = {}) {
    const result = await Course.findAll(options);
    
    // Add categories for each course
    for (const course of result.courses) {
      course.categories = await Course.getCategories(course.id);
    }

    return result;
  }

  // Update course
  static async updateCourse(courseId, updateData, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update this course');
      }
    }

    const validationErrors = this.validateCourseData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const updatedCourse = await Course.update(courseId, updateData);

    // Update categories if provided
    if (updateData.categoryIds) {
      // Remove existing categories
      await executeQuery('DELETE FROM course_categories WHERE course_id = ?', [courseId]);
      
      // Add new categories
      for (const categoryId of updateData.categoryIds) {
        await Course.addCategory(courseId, categoryId);
      }
    }

    return await Course.findById(courseId, true);
  }

  // Delete course
  static async deleteCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to delete this course');
      }
    }

    // Check if course has enrollments
    const enrollmentCount = await this.getEnrollmentCount(courseId);
    if (enrollmentCount > 0) {
      throw new Error('Cannot delete course with active enrollments');
    }

    const deleted = await Course.delete(courseId);
    if (!deleted) {
      throw new Error('Failed to delete course');
    }

    return { message: 'Course deleted successfully' };
  }

  // Enroll user in course
  static async enrollUser(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'PUBLISHED') {
      throw new Error('Course is not available for enrollment');
    }

    // Check if already enrolled
    const isEnrolled = await Course.isUserEnrolled(courseId, userId);
    if (isEnrolled) {
      throw new Error('User is already enrolled in this course');
    }

    // Create enrollment
    const query = `
      INSERT INTO enrollments (user_id, course_id, enrollment_date, status)
      VALUES (?, ?, CURRENT_TIMESTAMP, 'ACTIVE')
    `;
    
    await executeQuery(query, [userId, courseId]);

    return { message: 'Successfully enrolled in course' };
  }

  // Unenroll user from course
  static async unenrollUser(courseId, userId) {
    const isEnrolled = await Course.isUserEnrolled(courseId, userId);
    if (!isEnrolled) {
      throw new Error('User is not enrolled in this course');
    }

    const query = 'DELETE FROM enrollments WHERE course_id = ? AND user_id = ?';
    await executeQuery(query, [courseId, userId]);

    // Delete user progress for this course
    const Progress = require('../models/Progress');
    await Progress.deleteCourseProgress(userId, courseId);

    return { message: 'Successfully unenrolled from course' };
  }

  // Get user enrollments
  static async getUserEnrollments(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'ACTIVE'
    } = options;

    const offset = (page - 1) * limit;

    const query = `
      SELECT c.*, e.enrollment_date, e.status as enrollment_status,
             u.first_name as instructor_first_name, u.last_name as instructor_last_name
      FROM enrollments e
      INNER JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE e.user_id = ? AND e.status = ?
      ORDER BY e.enrollment_date DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM enrollments e
      WHERE e.user_id = ? AND e.status = ?
    `;

    const [courses, countResult] = await Promise.all([
      executeQuery(query, [userId, status, limit, offset]),
      executeQuery(countQuery, [userId, status])
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get progress for each course
    const Progress = require('../models/Progress');
    for (const course of courses) {
      course.progress = await Progress.getCourseSummary(userId, course.id);
      course.categories = await Course.getCategories(course.id);
    }

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Get course lessons
  static async getCourseLessons(courseId, userId = null) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const Lesson = require('../models/Lesson');
    return await Lesson.findByCourseId(courseId, userId);
  }

  // Get course quizzes
  static async getCourseQuizzes(courseId, userId = null) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const Quiz = require('../models/Quiz');
    const result = await Quiz.findAll({ courseId });
    
    // Check user access for each quiz if userId provided
    if (userId) {
      for (const quiz of result.quizzes) {
        const accessInfo = await Quiz.canUserTakeQuiz(quiz.id, userId);
        quiz.canTake = accessInfo.canTake;
        quiz.attemptsLeft = accessInfo.attemptsLeft;
      }
    }

    return result.quizzes;
  }

  // Rate course
  static async rateCourse(courseId, userId, ratingData) {
    const { rating, review } = ratingData;

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user is enrolled
    const isEnrolled = await Course.isUserEnrolled(courseId, userId);
    if (!isEnrolled) {
      throw new Error('You must be enrolled to rate this course');
    }

    // Check if user already rated
    const existingRating = await executeQuery(
      'SELECT id FROM course_ratings WHERE course_id = ? AND user_id = ?',
      [courseId, userId]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await executeQuery(
        'UPDATE course_ratings SET rating = ?, review = ?, updated_at = CURRENT_TIMESTAMP WHERE course_id = ? AND user_id = ?',
        [rating, review, courseId, userId]
      );
    } else {
      // Create new rating
      await executeQuery(
        'INSERT INTO course_ratings (course_id, user_id, rating, review) VALUES (?, ?, ?, ?)',
        [courseId, userId, rating, review]
      );
    }

    return { message: 'Course rated successfully' };
  }

  // Get course ratings
  static async getCourseRatings(courseId, options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const offset = (page - 1) * limit;

    const query = `
      SELECT cr.*, u.first_name, u.last_name, u.profile_picture
      FROM course_ratings cr
      INNER JOIN users u ON cr.user_id = u.id
      WHERE cr.course_id = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total, AVG(rating) as average_rating
      FROM course_ratings
      WHERE course_id = ?
    `;

    const [ratings, stats] = await Promise.all([
      executeQuery(query, [courseId, limit, offset]),
      executeQuery(countQuery, [courseId])
    ]);

    const total = stats[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
      ratings,
      statistics: {
        total,
        averageRating: stats[0].average_rating || 0
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Get popular courses
  static async getPopularCourses(limit = 10) {
    return await Course.getPopular(limit);
  }

  // Search courses
  static async searchCourses(query, options = {}) {
    const searchOptions = {
      ...options,
      search: query
    };

    return await Course.findAll(searchOptions);
  }

  // Get course statistics
  static async getCourseStatistics(courseId = null) {
    return await Course.getStatistics(courseId);
  }

  // Get enrollment count
  static async getEnrollmentCount(courseId) {
    const result = await executeQuery(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [courseId]
    );
    return result[0].count;
  }

  // Validate course data
  static validateCourseData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.title) {
      if (!data.title || data.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
      }
    }

    if (!isUpdate || data.description) {
      if (!data.description || data.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
    }

    if (data.price !== undefined) {
      if (data.price < 0) {
        errors.push('Price cannot be negative');
      }
    }

    if (data.level) {
      const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
      if (!validLevels.includes(data.level)) {
        errors.push('Invalid level. Must be BEGINNER, INTERMEDIATE, or ADVANCED');
      }
    }

    if (data.language) {
      const validLanguages = ['ar', 'en', 'fr'];
      if (!validLanguages.includes(data.language)) {
        errors.push('Invalid language. Must be ar, en, or fr');
      }
    }

    return errors;
  }

  // Check if user can access course
  static async canUserAccessCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      return { canAccess: false, reason: 'Course not found' };
    }

    // If course is not published, only creator, instructor, and admins can access
    if (course.status !== 'PUBLISHED') {
      if (course.creatorId === userId || course.instructorId === userId) {
        return { canAccess: true };
      }

      const user = await User.findById(userId);
      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        return { canAccess: true };
      }

      return { canAccess: false, reason: 'Course not published' };
    }

    // Check if user is enrolled
    const isEnrolled = await Course.isUserEnrolled(courseId, userId);
    if (!isEnrolled) {
      return { canAccess: false, reason: 'Not enrolled' };
    }

    return { canAccess: true };
  }

  // Get instructor courses
  static async getInstructorCourses(instructorId, options = {}) {
    return await Course.findAll({
      ...options,
      instructorId
    });
  }

  // Publish course
  static async publishCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to publish this course');
      }
    }

    // Validate course is ready for publishing
    const Lesson = require('../models/Lesson');
    const lessons = await Lesson.findByCourseId(courseId);
    
    if (lessons.length === 0) {
      throw new Error('Course must have at least one lesson to be published');
    }

    return await Course.update(courseId, {
      status: 'PUBLISHED',
      isPublished: true,
      publishedAt: new Date()
    });
  }

  // Unpublish course
  static async unpublishCourse(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to unpublish this course');
      }
    }

    return await Course.update(courseId, {
      status: 'DRAFT',
      isPublished: false
    });
  }
}

module.exports = CourseService;