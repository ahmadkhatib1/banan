const { executeQuery, getPaginatedResults } = require('../config/database');

class Lesson {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.content = data.content;
    this.videoUrl = data.video_url;
    this.videoDuration = data.video_duration;
    this.thumbnail = data.thumbnail;
    this.captionsUrl = data.captions_url;
    this.signLanguageVideoUrl = data.sign_language_video_url;
    this.transcript = data.transcript;
    this.type = data.type;
    this.status = data.status;
    this.order = data.order;
    this.isFree = data.is_free;
    this.resources = data.resources;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.courseId = data.course_id;
  }

  // Create new lesson
  static async create(lessonData) {
    const {
      title,
      description,
      content,
      videoUrl,
      videoDuration,
      thumbnail,
      captionsUrl,
      signLanguageVideoUrl,
      transcript,
      type = 'VIDEO',
      order,
      isFree = false,
      resources,
      courseId
    } = lessonData;

    const query = `
      INSERT INTO lessons (
        title, description, content, video_url, video_duration,
        thumbnail, captions_url, sign_language_video_url, transcript,
        type, \`order\`, is_free, resources, course_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      title, description, content, videoUrl, videoDuration,
      thumbnail, captionsUrl, signLanguageVideoUrl, transcript,
      type, order, isFree, resources, courseId
    ]);

    return await Lesson.findById(result.insertId);
  }

  // Find lesson by ID
  static async findById(id, includeProgress = false, userId = null) {
    let query = `
      SELECT l.*, c.title as course_title, c.status as course_status
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
    `;

    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const lesson = new Lesson(results[0]);
    lesson.courseTitle = results[0].course_title;
    lesson.courseStatus = results[0].course_status;

    if (includeProgress && userId) {
      const progressQuery = `
        SELECT * FROM progress 
        WHERE lesson_id = ? AND user_id = ?
      `;
      const progressResults = await executeQuery(progressQuery, [id, userId]);
      lesson.progress = progressResults.length > 0 ? progressResults[0] : null;
    }

    return lesson;
  }

  // Get all lessons with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      courseId,
      type,
      status,
      search,
      userId
    } = options;

    let whereConditions = [];
    let params = [];

    if (courseId) {
      whereConditions.push('l.course_id = ?');
      params.push(courseId);
    }

    if (type) {
      whereConditions.push('l.type = ?');
      params.push(type);
    }

    if (status) {
      whereConditions.push('l.status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(l.title LIKE ? OR l.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let baseQuery = `
      SELECT l.*, c.title as course_title, c.status as course_status
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      ${whereClause}
      ORDER BY l.course_id, l.\`order\`
    `;

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM lessons l 
      LEFT JOIN courses c ON l.course_id = c.id
      ${whereClause}
    `;

    // If userId is provided, include progress information
    if (userId) {
      baseQuery = `
        SELECT l.*, c.title as course_title, c.status as course_status,
               p.completed_at, p.completion_percentage, p.time_spent
        FROM lessons l
        LEFT JOIN courses c ON l.course_id = c.id
        LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
        ${whereClause}
        ORDER BY l.course_id, l.\`order\`
      `;
      params.unshift(userId);
    }

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    const lessons = result.data.map(lessonData => {
      const lesson = new Lesson(lessonData);
      lesson.courseTitle = lessonData.course_title;
      lesson.courseStatus = lessonData.course_status;
      
      if (userId && lessonData.completed_at !== undefined) {
        lesson.progress = {
          completedAt: lessonData.completed_at,
          completionPercentage: lessonData.completion_percentage || 0,
          timeSpent: lessonData.time_spent || 0
        };
      }
      
      return lesson;
    });

    return {
      lessons,
      pagination: result.pagination
    };
  }

  // Get lessons by course ID
  static async findByCourseId(courseId, userId = null) {
    let query = `
      SELECT l.*
      FROM lessons l
      WHERE l.course_id = ?
      ORDER BY l.\`order\`
    `;

    let params = [courseId];

    if (userId) {
      query = `
        SELECT l.*, p.completed_at, p.completion_percentage, p.time_spent
        FROM lessons l
        LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ?
        WHERE l.course_id = ?
        ORDER BY l.\`order\`
      `;
      params = [userId, courseId];
    }

    const results = await executeQuery(query, params);
    
    return results.map(lessonData => {
      const lesson = new Lesson(lessonData);
      
      if (userId && lessonData.completed_at !== undefined) {
        lesson.progress = {
          completedAt: lessonData.completed_at,
          completionPercentage: lessonData.completion_percentage || 0,
          timeSpent: lessonData.time_spent || 0
        };
      }
      
      return lesson;
    });
  }

  // Update lesson
  static async update(id, updateData) {
    const allowedFields = [
      'title', 'description', 'content', 'video_url', 'video_duration',
      'thumbnail', 'captions_url', 'sign_language_video_url', 'transcript',
      'type', 'status', 'order', 'is_free', 'resources'
    ];

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

    params.push(id);

    const query = `
      UPDATE lessons 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await Lesson.findById(id);
  }

  // Delete lesson
  static async delete(id) {
    const query = 'DELETE FROM lessons WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Get next lesson in course
  static async getNextLesson(courseId, currentOrder) {
    const query = `
      SELECT * FROM lessons 
      WHERE course_id = ? AND \`order\` > ? AND status = 'PUBLISHED'
      ORDER BY \`order\` ASC 
      LIMIT 1
    `;
    
    const results = await executeQuery(query, [courseId, currentOrder]);
    return results.length > 0 ? new Lesson(results[0]) : null;
  }

  // Get previous lesson in course
  static async getPreviousLesson(courseId, currentOrder) {
    const query = `
      SELECT * FROM lessons 
      WHERE course_id = ? AND \`order\` < ? AND status = 'PUBLISHED'
      ORDER BY \`order\` DESC 
      LIMIT 1
    `;
    
    const results = await executeQuery(query, [courseId, currentOrder]);
    return results.length > 0 ? new Lesson(results[0]) : null;
  }

  // Reorder lessons
  static async reorderLessons(courseId, lessonOrders) {
    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();

      for (const { lessonId, order } of lessonOrders) {
        await connection.execute(
          'UPDATE lessons SET `order` = ? WHERE id = ? AND course_id = ?',
          [order, lessonId, courseId]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get lesson statistics
  static async getStatistics(courseId = null) {
    let whereClause = '';
    let params = [];

    if (courseId) {
      whereClause = 'WHERE course_id = ?';
      params.push(courseId);
    }

    const queries = [
      `SELECT COUNT(*) as total FROM lessons ${whereClause}`,
      `SELECT COUNT(*) as published FROM lessons ${whereClause} ${courseId ? 'AND' : 'WHERE'} status = 'PUBLISHED'`,
      `SELECT COUNT(*) as draft FROM lessons ${whereClause} ${courseId ? 'AND' : 'WHERE'} status = 'DRAFT'`,
      `SELECT AVG(video_duration) as average_duration FROM lessons ${whereClause} ${courseId ? 'AND' : 'WHERE'} video_duration IS NOT NULL`,
      `SELECT SUM(video_duration) as total_duration FROM lessons ${whereClause} ${courseId ? 'AND' : 'WHERE'} video_duration IS NOT NULL`
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query, params))
    );

    return {
      total: results[0][0].total,
      published: results[1][0].published,
      draft: results[2][0].draft,
      averageDuration: results[3][0].average_duration || 0,
      totalDuration: results[4][0].total_duration || 0
    };
  }

  // Check if user can access lesson
  static async canUserAccess(lessonId, userId) {
    const query = `
      SELECT l.is_free, l.course_id,
             e.id as enrollment_id,
             c.status as course_status
      FROM lessons l
      LEFT JOIN courses c ON l.course_id = c.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
      WHERE l.id = ?
    `;

    const results = await executeQuery(query, [userId, lessonId]);
    
    if (results.length === 0) {
      return false;
    }

    const lesson = results[0];
    
    // If lesson is free, allow access
    if (lesson.is_free) {
      return true;
    }

    // If course is not published, deny access (unless user is creator/instructor)
    if (lesson.course_status !== 'PUBLISHED') {
      return false;
    }

    // Check if user is enrolled
    return lesson.enrollment_id !== null;
  }

  // Get lesson completion rate
  static async getCompletionRate(lessonId) {
    const query = `
      SELECT 
        COUNT(DISTINCT e.user_id) as enrolled_users,
        COUNT(DISTINCT p.user_id) as completed_users
      FROM lessons l
      LEFT JOIN enrollments e ON l.course_id = e.course_id
      LEFT JOIN progress p ON l.id = p.lesson_id AND p.completed_at IS NOT NULL
      WHERE l.id = ?
    `;

    const results = await executeQuery(query, [lessonId]);
    const data = results[0];

    const enrolledUsers = data.enrolled_users || 0;
    const completedUsers = data.completed_users || 0;

    return {
      enrolledUsers,
      completedUsers,
      completionRate: enrolledUsers > 0 ? (completedUsers / enrolledUsers) * 100 : 0
    };
  }
}

module.exports = Lesson;