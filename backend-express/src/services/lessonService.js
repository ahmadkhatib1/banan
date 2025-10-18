const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

class LessonService {
  // Create new lesson
  static async createLesson(lessonData, userId) {
    const { courseId } = lessonData;

    // Check if course exists and user has permission
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to create lesson in this course');
      }
    }

    const validationErrors = this.validateLessonData(lessonData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Set order if not provided
    if (!lessonData.order) {
      const existingLessons = await Lesson.findByCourseId(courseId);
      lessonData.order = existingLessons.length + 1;
    }

    const lesson = await Lesson.create(lessonData);
    return await Lesson.findById(lesson.id);
  }

  // Get lesson by ID
  static async getLessonById(lessonId, userId = null) {
    const lesson = await Lesson.findById(lessonId, true, userId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if user can access this lesson
    if (userId) {
      const canAccess = await Lesson.canUserAccess(lessonId, userId);
      if (!canAccess) {
        throw new Error('Access denied to this lesson');
      }

      // Get next and previous lessons
      lesson.nextLesson = await Lesson.getNextLesson(lesson.courseId, lesson.order);
      lesson.previousLesson = await Lesson.getPreviousLesson(lesson.courseId, lesson.order);
    }

    return lesson;
  }

  // Get all lessons with filters
  static async getAllLessons(options = {}) {
    return await Lesson.findAll(options);
  }

  // Get lessons by course ID
  static async getLessonsByCourse(courseId, userId = null) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    if (userId) {
      const CourseService = require('./courseService');
      const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
      if (!accessInfo.canAccess) {
        throw new Error(`Access denied: ${accessInfo.reason}`);
      }
    }

    return await Lesson.findByCourseId(courseId, userId);
  }

  // Update lesson
  static async updateLesson(lessonId, updateData, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check permissions
    const course = await Course.findById(lesson.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update this lesson');
      }
    }

    const validationErrors = this.validateLessonData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Lesson.update(lessonId, updateData);
  }

  // Delete lesson
  static async deleteLesson(lessonId, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check permissions
    const course = await Course.findById(lesson.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to delete this lesson');
      }
    }

    const deleted = await Lesson.delete(lessonId);
    if (!deleted) {
      throw new Error('Failed to delete lesson');
    }

    return { message: 'Lesson deleted successfully' };
  }

  // Update lesson progress
  static async updateProgress(lessonId, userId, progressData) {
    const { completionPercentage, timeSpent } = progressData;

    // Validate lesson exists and user can access it
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    // Validate progress data
    if (completionPercentage < 0 || completionPercentage > 100) {
      throw new Error('Completion percentage must be between 0 and 100');
    }

    if (timeSpent < 0) {
      throw new Error('Time spent cannot be negative');
    }

    // Update or create progress
    const progress = await Progress.createOrUpdate({
      userId,
      courseId: lesson.courseId,
      lessonId,
      completionPercentage,
      timeSpent
    });

    return progress;
  }

  // Mark lesson as completed
  static async markCompleted(lessonId, userId, timeSpent = 0) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    const progress = await Progress.markCompleted(userId, lessonId, timeSpent);

    // Check if course is completed
    const isCompleted = await Progress.isCourseCompleted(userId, lesson.courseId);
    
    return {
      progress,
      courseCompleted: isCompleted
    };
  }

  // Get lesson progress for user
  static async getLessonProgress(lessonId, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return await Progress.findByUserAndLesson(userId, lessonId);
  }

  // Reorder lessons in course
  static async reorderLessons(courseId, lessonOrders, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to reorder lessons in this course');
      }
    }

    // Validate lesson orders
    const existingLessons = await Lesson.findByCourseId(courseId);
    const existingLessonIds = existingLessons.map(l => l.id);

    for (const { lessonId } of lessonOrders) {
      if (!existingLessonIds.includes(lessonId)) {
        throw new Error(`Lesson ${lessonId} does not belong to this course`);
      }
    }

    await Lesson.reorderLessons(courseId, lessonOrders);

    return { message: 'Lessons reordered successfully' };
  }

  // Get lesson statistics
  static async getLessonStatistics(courseId = null) {
    return await Lesson.getStatistics(courseId);
  }

  // Get lesson completion rate
  static async getCompletionRate(lessonId) {
    return await Lesson.getCompletionRate(lessonId);
  }

  // Search lessons
  static async searchLessons(query, options = {}) {
    const searchOptions = {
      ...options,
      search: query
    };

    return await Lesson.findAll(searchOptions);
  }

  // Get next lesson for user
  static async getNextLesson(courseId, currentLessonId, userId) {
    const currentLesson = await Lesson.findById(currentLessonId);
    if (!currentLesson) {
      throw new Error('Current lesson not found');
    }

    if (currentLesson.courseId !== courseId) {
      throw new Error('Lesson does not belong to the specified course');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    return await Lesson.getNextLesson(courseId, currentLesson.order);
  }

  // Get previous lesson for user
  static async getPreviousLesson(courseId, currentLessonId, userId) {
    const currentLesson = await Lesson.findById(currentLessonId);
    if (!currentLesson) {
      throw new Error('Current lesson not found');
    }

    if (currentLesson.courseId !== courseId) {
      throw new Error('Lesson does not belong to the specified course');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    return await Lesson.getPreviousLesson(courseId, currentLesson.order);
  }

  // Get user's current lesson in course
  static async getCurrentLesson(courseId, userId) {
    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    // Get next incomplete lesson
    const nextLesson = await Progress.getNextLesson(userId, courseId);
    if (nextLesson) {
      return await Lesson.findById(nextLesson.id, true, userId);
    }

    // If all lessons are completed, return the last lesson
    const lessons = await Lesson.findByCourseId(courseId, userId);
    if (lessons.length > 0) {
      return lessons[lessons.length - 1];
    }

    return null;
  }

  // Validate lesson data
  static validateLessonData(data, isUpdate = false) {
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

    if (data.type) {
      const validTypes = ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'];
      if (!validTypes.includes(data.type)) {
        errors.push('Invalid lesson type. Must be VIDEO, TEXT, QUIZ, or ASSIGNMENT');
      }
    }

    if (data.videoDuration !== undefined) {
      if (data.videoDuration < 0) {
        errors.push('Video duration cannot be negative');
      }
    }

    if (data.order !== undefined) {
      if (data.order < 1) {
        errors.push('Lesson order must be at least 1');
      }
    }

    return errors;
  }

  // Check if user can access lesson
  static async canUserAccessLesson(lessonId, userId) {
    return await Lesson.canUserAccess(lessonId, userId);
  }

  // Get lesson resources
  static async getLessonResources(lessonId, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    // Parse resources if they exist
    let resources = [];
    if (lesson.resources) {
      try {
        resources = JSON.parse(lesson.resources);
      } catch (error) {
        console.error('Error parsing lesson resources:', error);
      }
    }

    return resources;
  }

  // Update lesson resources
  static async updateLessonResources(lessonId, resources, userId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check permissions
    const course = await Course.findById(lesson.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update lesson resources');
      }
    }

    const resourcesJson = JSON.stringify(resources);
    return await Lesson.update(lessonId, { resources: resourcesJson });
  }
}

module.exports = LessonService;