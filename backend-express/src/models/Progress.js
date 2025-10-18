const { executeQuery, getPaginatedResults } = require('../config/database');

class Progress {
  constructor(data) {
    this.id = data.id;
    this.completionPercentage = data.completion_percentage;
    this.timeSpent = data.time_spent;
    this.watchTime = data.watch_time;
    this.status = data.status;
    this.lastAccessedAt = data.last_accessed_at;
    this.completedAt = data.completed_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.userId = data.user_id;
    this.courseId = data.course_id;
    this.lessonId = data.lesson_id;
  }

  // Create or update progress
  static async createOrUpdate(progressData) {
    const {
      userId,
      courseId,
      lessonId,
      completionPercentage = 0,
      timeSpent = 0
    } = progressData;

    const query = `
      INSERT INTO progress (
        user_id, course_id, lesson_id, completion_percentage, 
        time_spent, last_accessed_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        completion_percentage = VALUES(completion_percentage),
        time_spent = time_spent + VALUES(time_spent),
        last_accessed_at = CURRENT_TIMESTAMP,
        completed_at = CASE 
          WHEN VALUES(completion_percentage) >= 100 AND completed_at IS NULL 
          THEN CURRENT_TIMESTAMP 
          ELSE completed_at 
        END,
        updated_at = CURRENT_TIMESTAMP
    `;

    await executeQuery(query, [userId, courseId, lessonId, completionPercentage, timeSpent]);
    return await Progress.findByUserAndLesson(userId, lessonId);
  }

  // Find progress by user and lesson
  static async findByUserAndLesson(userId, lessonId) {
    const query = `
      SELECT p.*, l.title as lesson_title, c.title as course_title
      FROM progress p
      LEFT JOIN lessons l ON p.lesson_id = l.id
      LEFT JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ? AND p.lesson_id = ?
    `;

    const results = await executeQuery(query, [userId, lessonId]);
    
    if (results.length === 0) {
      return null;
    }

    const progress = new Progress(results[0]);
    progress.lessonTitle = results[0].lesson_title;
    progress.courseTitle = results[0].course_title;
    
    return progress;
  }

  // Get user progress for a course
  static async getUserCourseProgress(userId, courseId) {
    const query = `
      SELECT p.*, l.title as lesson_title, l.order as lesson_order
      FROM progress p
      INNER JOIN lessons l ON p.lesson_id = l.id
      WHERE p.user_id = ? AND p.course_id = ?
      ORDER BY l.order
    `;

    const results = await executeQuery(query, [userId, courseId]);
    
    return results.map(progressData => {
      const progress = new Progress(progressData);
      progress.lessonTitle = progressData.lesson_title;
      progress.lessonOrder = progressData.lesson_order;
      return progress;
    });
  }

  // Get course progress summary for user
  static async getCourseSummary(userId, courseId) {
    const query = `
      SELECT 
        COUNT(l.id) as total_lessons,
        COUNT(p.id) as started_lessons,
        COUNT(CASE WHEN p.completed_at IS NOT NULL THEN 1 END) as completed_lessons,
        AVG(CASE WHEN p.id IS NOT NULL THEN p.completion_percentage ELSE 0 END) as overall_progress,
        SUM(CASE WHEN p.id IS NOT NULL THEN p.time_spent ELSE 0 END) as total_time_spent,
        MAX(p.last_accessed_at) as last_accessed
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
      WHERE l.course_id = ? AND l.status = 'PUBLISHED'
    `;

    const results = await executeQuery(query, [userId, courseId]);
    const summary = results[0];

    return {
      totalLessons: summary.total_lessons || 0,
      startedLessons: summary.started_lessons || 0,
      completedLessons: summary.completed_lessons || 0,
      overallProgress: Math.round(summary.overall_progress || 0),
      totalTimeSpent: summary.total_time_spent || 0,
      lastAccessed: summary.last_accessed,
      isCompleted: summary.completed_lessons === summary.total_lessons && summary.total_lessons > 0
    };
  }

  // Get all user progress with pagination
  static async getUserProgress(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      courseId,
      completed
    } = options;

    let whereConditions = ['p.user_id = ?'];
    let params = [userId];

    if (courseId) {
      whereConditions.push('p.course_id = ?');
      params.push(courseId);
    }

    if (completed !== undefined) {
      if (completed) {
        whereConditions.push('p.completed_at IS NOT NULL');
      } else {
        whereConditions.push('p.completed_at IS NULL');
      }
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const baseQuery = `
      SELECT p.*, l.title as lesson_title, l.order as lesson_order,
             c.title as course_title, c.thumbnail as course_thumbnail
      FROM progress p
      INNER JOIN lessons l ON p.lesson_id = l.id
      INNER JOIN courses c ON p.course_id = c.id
      ${whereClause}
      ORDER BY p.last_accessed_at DESC
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM progress p 
      INNER JOIN lessons l ON p.lesson_id = l.id
      INNER JOIN courses c ON p.course_id = c.id
      ${whereClause}
    `;

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    const progress = result.data.map(progressData => {
      const prog = new Progress(progressData);
      prog.lessonTitle = progressData.lesson_title;
      prog.lessonOrder = progressData.lesson_order;
      prog.courseTitle = progressData.course_title;
      prog.courseThumbnail = progressData.course_thumbnail;
      return prog;
    });

    return {
      progress,
      pagination: result.pagination
    };
  }

  // Update progress
  static async update(userId, lessonId, updateData) {
    const allowedFields = ['completion_percentage', 'time_spent'];
    const updateFields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updateFields.push(`${dbField} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add completion logic
    if (updateData.completionPercentage >= 100) {
      updateFields.push('completed_at = CASE WHEN completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END');
    }

    updateFields.push('last_accessed_at = CURRENT_TIMESTAMP');
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(userId, lessonId);

    const query = `
      UPDATE progress 
      SET ${updateFields.join(', ')}
      WHERE user_id = ? AND lesson_id = ?
    `;

    await executeQuery(query, params);
    return await Progress.findByUserAndLesson(userId, lessonId);
  }

  // Mark lesson as completed
  static async markCompleted(userId, lessonId, timeSpent = 0) {
    const query = `
      UPDATE progress 
      SET completion_percentage = 100,
          time_spent = time_spent + ?,
          completed_at = CASE WHEN completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END,
          last_accessed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND lesson_id = ?
    `;

    await executeQuery(query, [timeSpent, userId, lessonId]);
    return await Progress.findByUserAndLesson(userId, lessonId);
  }

  // Get learning statistics for user
  static async getUserStatistics(userId) {
    const queries = [
      // Total courses enrolled
      'SELECT COUNT(DISTINCT course_id) as enrolled_courses FROM enrollments WHERE user_id = ?',
      
      // Completed courses
      `SELECT COUNT(DISTINCT p.course_id) as completed_courses
       FROM progress p
       INNER JOIN (
         SELECT course_id, COUNT(*) as total_lessons
         FROM lessons 
         WHERE status = 'PUBLISHED'
         GROUP BY course_id
       ) l ON p.course_id = l.course_id
       WHERE p.user_id = ? AND p.completed_at IS NOT NULL
       GROUP BY p.course_id
       HAVING COUNT(p.id) = MAX(l.total_lessons)`,
      
      // Total lessons completed
      'SELECT COUNT(*) as completed_lessons FROM progress WHERE user_id = ? AND completed_at IS NOT NULL',
      
      // Total time spent
      'SELECT SUM(time_spent) as total_time FROM progress WHERE user_id = ?',
      
      // Current streak (consecutive days with activity)
      `SELECT COUNT(*) as current_streak
       FROM (
         SELECT DATE(last_accessed_at) as access_date
         FROM progress 
         WHERE user_id = ? AND last_accessed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY DATE(last_accessed_at)
         ORDER BY access_date DESC
       ) daily_activity`,
      
      // Average completion percentage
      'SELECT AVG(completion_percentage) as avg_completion FROM progress WHERE user_id = ?'
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query, [userId]))
    );

    return {
      enrolledCourses: results[0][0].enrolled_courses || 0,
      completedCourses: results[1].length || 0,
      completedLessons: results[2][0].completed_lessons || 0,
      totalTimeSpent: results[3][0].total_time || 0,
      currentStreak: results[4][0].current_streak || 0,
      averageCompletion: Math.round(results[5][0].avg_completion || 0)
    };
  }

  // Get recent activity for user
  static async getRecentActivity(userId, limit = 10) {
    const query = `
      SELECT p.*, l.title as lesson_title, c.title as course_title,
             c.thumbnail as course_thumbnail
      FROM progress p
      INNER JOIN lessons l ON p.lesson_id = l.id
      INNER JOIN courses c ON p.course_id = c.id
      WHERE p.user_id = ?
      ORDER BY p.last_accessed_at DESC
      LIMIT ?
    `;

    const results = await executeQuery(query, [userId, limit]);
    
    return results.map(progressData => {
      const progress = new Progress(progressData);
      progress.lessonTitle = progressData.lesson_title;
      progress.courseTitle = progressData.course_title;
      progress.courseThumbnail = progressData.course_thumbnail;
      return progress;
    });
  }

  // Get progress leaderboard
  static async getLeaderboard(courseId = null, limit = 10) {
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_picture,
             COUNT(DISTINCT p.lesson_id) as completed_lessons,
             SUM(p.time_spent) as total_time,
             AVG(p.completion_percentage) as avg_completion
      FROM users u
      INNER JOIN progress p ON u.id = p.user_id
      WHERE p.completed_at IS NOT NULL
    `;

    let params = [];

    if (courseId) {
      query += ' AND p.course_id = ?';
      params.push(courseId);
    }

    query += `
      GROUP BY u.id
      ORDER BY completed_lessons DESC, total_time DESC
      LIMIT ?
    `;

    params.push(limit);

    const results = await executeQuery(query, params);
    
    return results.map((userData, index) => ({
      rank: index + 1,
      user: {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profilePicture: userData.profile_picture
      },
      completedLessons: userData.completed_lessons,
      totalTime: userData.total_time,
      averageCompletion: Math.round(userData.avg_completion)
    }));
  }

  // Delete progress
  static async delete(userId, lessonId) {
    const query = 'DELETE FROM progress WHERE user_id = ? AND lesson_id = ?';
    const result = await executeQuery(query, [userId, lessonId]);
    return result.affectedRows > 0;
  }

  // Delete all progress for a user in a course
  static async deleteCourseProgress(userId, courseId) {
    const query = 'DELETE FROM progress WHERE user_id = ? AND course_id = ?';
    const result = await executeQuery(query, [userId, courseId]);
    return result.affectedRows > 0;
  }

  // Check if user can access a specific lesson (strict sequencing)
  static async canUserAccessLesson(userId, lessonId) {
    // Get lesson details
    const lessonQuery = `
      SELECT l.id, l.course_id, l.order, l.is_free, c.is_free as course_is_free
      FROM lessons l
      INNER JOIN courses c ON l.course_id = c.id
      WHERE l.id = ? AND l.status = 'PUBLISHED'
    `;
    
    const lessonResults = await executeQuery(lessonQuery, [lessonId]);
    if (lessonResults.length === 0) {
      return { canAccess: false, reason: 'LESSON_NOT_FOUND' };
    }
    
    const lesson = lessonResults[0];
    
    // Check if lesson is free or course is free
    if (lesson.is_free || lesson.course_is_free) {
      return { canAccess: true, reason: 'FREE_CONTENT' };
    }
    
    // Check enrollment
    const enrollmentQuery = `
      SELECT status FROM enrollments 
      WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE'
    `;
    
    const enrollmentResults = await executeQuery(enrollmentQuery, [userId, lesson.course_id]);
    if (enrollmentResults.length === 0) {
      return { canAccess: false, reason: 'NOT_ENROLLED' };
    }
    
    // If it's the first lesson (order = 1), allow access
    if (lesson.order === 1) {
      return { canAccess: true, reason: 'FIRST_LESSON' };
    }
    
    // Check if previous lesson is completed
    const previousLessonQuery = `
      SELECT l.id, p.completed_at
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
      WHERE l.course_id = ? AND l.order = ? AND l.status = 'PUBLISHED'
    `;
    
    const previousResults = await executeQuery(previousLessonQuery, [userId, lesson.course_id, lesson.order - 1]);
    
    if (previousResults.length === 0) {
      return { canAccess: false, reason: 'PREVIOUS_LESSON_NOT_FOUND' };
    }
    
    const previousLesson = previousResults[0];
    if (!previousLesson.completed_at) {
      return { canAccess: false, reason: 'PREVIOUS_LESSON_NOT_COMPLETED' };
    }
    
    // Check if there are any quizzes that need to be passed to unlock this lesson
    const Quiz = require('./Quiz');
    const unlockingQuizzes = await Quiz.getQuizzesUnlockingLesson(lessonId);
    
    for (const quiz of unlockingQuizzes) {
      const hasPassed = await Quiz.hasUserPassedQuiz(userId, quiz.id);
      if (!hasPassed) {
        return { 
          canAccess: false, 
          reason: 'QUIZ_NOT_PASSED',
          requiredQuiz: quiz.id,
          quizTitle: quiz.title
        };
      }
    }
    
    return { canAccess: true, reason: 'SEQUENTIAL_ACCESS' };
  }

  // Get next lesson for user in course
  static async getNextLesson(userId, courseId) {
    const query = `
      SELECT l.id, l.title, l.order
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
      WHERE l.course_id = ? AND l.status = 'PUBLISHED'
        AND (p.id IS NULL OR p.completed_at IS NULL)
      ORDER BY l.order ASC
      LIMIT 1
    `;

    const results = await executeQuery(query, [userId, courseId]);
    
    if (results.length === 0) {
      return null;
    }
    
    const nextLesson = results[0];
    
    // Check if user can access this lesson
    const accessCheck = await Progress.canUserAccessLesson(userId, nextLesson.id);
    
    if (!accessCheck.canAccess) {
      return null;
    }
    
    return nextLesson;
  }

  // Check if user completed course
  static async isCourseCompleted(userId, courseId) {
    const query = `
      SELECT 
        COUNT(l.id) as total_lessons,
        COUNT(p.id) as completed_lessons
      FROM lessons l
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ? AND p.completed_at IS NOT NULL
      WHERE l.course_id = ? AND l.status = 'PUBLISHED'
    `;

    const results = await executeQuery(query, [userId, courseId]);
    const data = results[0];

    return data.total_lessons > 0 && data.total_lessons === data.completed_lessons;
  }
}

module.exports = Progress;