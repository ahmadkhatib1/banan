const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

class ProgressService {
  // Create or update progress
  static async updateProgress(userId, lessonId, progressData) {
    const { completionPercentage, timeSpent } = progressData;

    // Validate lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if user can access lesson
    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    // Validate progress data
    const validationErrors = this.validateProgressData(progressData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    // Create or update progress
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
  static async markLessonCompleted(userId, lessonId, timeSpent = 0) {
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

  // Get user progress for a specific lesson
  static async getLessonProgress(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return await Progress.findByUserAndLesson(userId, lessonId);
  }

  // Get user progress for a course
  static async getCourseProgress(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    return await Progress.getUserCourseProgress(userId, courseId);
  }

  // Get course progress summary
  static async getCourseProgressSummary(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    return await Progress.getCourseProgressSummary(userId, courseId);
  }

  // Get all user progress with pagination
  static async getUserProgress(userId, options = {}) {
    return await Progress.getUserProgress(userId, options);
  }

  // Get user learning statistics
  static async getUserStatistics(userId) {
    return await Progress.getUserStatistics(userId);
  }

  // Get user's recent activity
  static async getRecentActivity(userId, limit = 10) {
    return await Progress.getRecentActivity(userId, limit);
  }

  // Get progress leaderboard
  static async getLeaderboard(courseId = null, limit = 10) {
    return await Progress.getLeaderboard(courseId, limit);
  }

  // Get next lesson for user in course
  static async getNextLesson(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    const nextLesson = await Progress.getNextLesson(userId, courseId);
    if (nextLesson) {
      return await Lesson.findById(nextLesson.id, true, userId);
    }

    return null;
  }

  // Check if user completed course
  static async isCourseCompleted(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    return await Progress.isCourseCompleted(userId, courseId);
  }

  // Get course completion percentage
  static async getCourseCompletionPercentage(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const summary = await Progress.getCourseProgressSummary(userId, courseId);
    if (!summary || summary.totalLessons === 0) {
      return 0;
    }

    return Math.round((summary.completedLessons / summary.totalLessons) * 100);
  }

  // Delete user progress for a lesson
  static async deleteLessonProgress(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if user can access lesson
    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    const deleted = await Progress.delete(userId, lessonId);
    if (!deleted) {
      throw new Error('Progress not found or already deleted');
    }

    return { message: 'Progress deleted successfully' };
  }

  // Delete all user progress for a course
  static async deleteCourseProgress(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    const deleted = await Progress.deleteCourseProgress(userId, courseId);
    return { 
      message: 'Course progress deleted successfully',
      deletedCount: deleted
    };
  }

  // Reset user progress for a lesson
  static async resetLessonProgress(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if user can access lesson
    const canAccess = await Lesson.canUserAccess(lessonId, userId);
    if (!canAccess) {
      throw new Error('Access denied to this lesson');
    }

    // Reset progress to 0%
    const progress = await Progress.createOrUpdate({
      userId,
      courseId: lesson.courseId,
      lessonId,
      completionPercentage: 0,
      timeSpent: 0
    });

    return progress;
  }

  // Get progress analytics for instructor/admin
  static async getProgressAnalytics(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to view course analytics');
      }
    }

    // Get course lessons
    const lessons = await Lesson.findByCourseId(courseId);
    const lessonIds = lessons.map(l => l.id);

    // Get progress data for all enrolled users
    const progressData = await Progress.getCourseAnalytics(courseId);

    // Calculate analytics
    const analytics = {
      totalEnrolled: progressData.totalEnrolled || 0,
      totalCompleted: progressData.totalCompleted || 0,
      averageProgress: progressData.averageProgress || 0,
      averageTimeSpent: progressData.averageTimeSpent || 0,
      completionRate: progressData.totalEnrolled > 0 
        ? Math.round((progressData.totalCompleted / progressData.totalEnrolled) * 100)
        : 0,
      lessonAnalytics: lessons.map(lesson => ({
        lessonId: lesson.id,
        title: lesson.title,
        completionRate: lesson.completionRate || 0,
        averageTimeSpent: lesson.averageTimeSpent || 0
      })),
      progressDistribution: progressData.progressDistribution || [],
      recentActivity: progressData.recentActivity || []
    };

    return analytics;
  }

  // Get user's learning path
  static async getUserLearningPath(userId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if user can access course
    const CourseService = require('./courseService');
    const accessInfo = await CourseService.canUserAccessCourse(courseId, userId);
    if (!accessInfo.canAccess) {
      throw new Error(`Access denied: ${accessInfo.reason}`);
    }

    // Get all lessons in order
    const lessons = await Lesson.findByCourseId(courseId, userId);
    
    // Get user progress for each lesson
    const learningPath = [];
    for (const lesson of lessons) {
      const progress = await Progress.findByUserAndLesson(userId, lesson.id);
      learningPath.push({
        lesson,
        progress,
        isCompleted: progress && progress.completionPercentage >= 100,
        isAccessible: await Lesson.canUserAccess(lesson.id, userId)
      });
    }

    return learningPath;
  }

  // Bulk update progress (for admin/instructor)
  static async bulkUpdateProgress(updates, userId) {
    // Validate user permissions
    const user = await User.findById(userId);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      throw new Error('Unauthorized to perform bulk progress updates');
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { userId: targetUserId, lessonId, completionPercentage, timeSpent } = update;
        
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
          errors.push(`Lesson ${lessonId} not found`);
          continue;
        }

        const progress = await Progress.createOrUpdate({
          userId: targetUserId,
          courseId: lesson.courseId,
          lessonId,
          completionPercentage,
          timeSpent
        });

        results.push(progress);
      } catch (error) {
        errors.push(`Error updating progress for user ${update.userId}, lesson ${update.lessonId}: ${error.message}`);
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors
    };
  }

  // Validate progress data
  static validateProgressData(data) {
    const errors = [];

    if (data.completionPercentage !== undefined) {
      if (data.completionPercentage < 0 || data.completionPercentage > 100) {
        errors.push('Completion percentage must be between 0 and 100');
      }
    }

    if (data.timeSpent !== undefined) {
      if (data.timeSpent < 0) {
        errors.push('Time spent cannot be negative');
      }
    }

    return errors;
  }

  // Get progress trends
  static async getProgressTrends(userId, courseId = null, days = 30) {
    return await Progress.getProgressTrends(userId, courseId, days);
  }

  // Get course engagement metrics
  static async getCourseEngagement(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to view course engagement metrics');
      }
    }

    return await Progress.getCourseEngagement(courseId);
  }
}

module.exports = ProgressService;