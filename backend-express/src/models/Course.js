const { executeQuery, getPaginatedResults } = require('../config/database');

class Course {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.shortDescription = data.short_description;
    this.thumbnail = data.thumbnail;
    this.coverImage = data.cover_image;
    this.level = data.level;
    this.status = data.status;
    this.price = data.price;
    this.originalPrice = data.original_price;
    this.duration = data.duration;
    this.language = data.language;
    this.tags = data.tags;
    this.requirements = data.requirements;
    this.objectives = data.objectives;
    this.isPublished = data.is_published;
    this.publishedAt = data.published_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.creatorId = data.creator_id;
    this.instructorId = data.instructor_id;
  }

  // Create new course
  static async create(courseData) {
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      coverImage,
      level,
      price = 0,
      originalPrice,
      duration,
      language = 'ar',
      tags,
      requirements,
      objectives,
      creatorId,
      instructorId
    } = courseData;

    const query = `
      INSERT INTO courses (
        title, description, short_description, thumbnail, cover_image,
        level, price, original_price, duration, language, tags,
        requirements, objectives, creator_id, instructor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      title, description, shortDescription, thumbnail, coverImage,
      level, price, originalPrice, duration, language, tags,
      requirements, objectives, creatorId, instructorId
    ]);

    return await Course.findById(result.insertId);
  }

  // Find course by ID
  static async findById(id, includeDetails = false) {
    let query = 'SELECT * FROM courses WHERE id = ?';
    
    if (includeDetails) {
      query = `
        SELECT c.*, 
               u1.first_name as creator_first_name, u1.last_name as creator_last_name,
               u2.first_name as instructor_first_name, u2.last_name as instructor_last_name,
               u2.email as instructor_email, u2.profile_picture as instructor_profile_picture,
               COUNT(DISTINCT e.id) as enrollment_count,
               COUNT(DISTINCT l.id) as lesson_count,
               AVG(cr.rating) as average_rating,
               COUNT(DISTINCT cr.id) as rating_count
        FROM courses c
        LEFT JOIN users u1 ON c.creator_id = u1.id
        LEFT JOIN users u2 ON c.instructor_id = u2.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN lessons l ON c.id = l.course_id AND l.status = 'PUBLISHED'
        LEFT JOIN course_ratings cr ON c.id = cr.course_id
        WHERE c.id = ?
        GROUP BY c.id
      `;
    }

    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const course = new Course(results[0]);
    
    if (includeDetails) {
      const data = results[0];
      course.creator = {
        firstName: data.creator_first_name,
        lastName: data.creator_last_name
      };
      course.instructor = data.instructor_id ? {
        id: data.instructor_id,
        firstName: data.instructor_first_name,
        lastName: data.instructor_last_name,
        email: data.instructor_email,
        profilePicture: data.instructor_profile_picture
      } : null;
      course.enrollmentCount = data.enrollment_count || 0;
      course.lessonCount = data.lesson_count || 0;
      course.averageRating = data.average_rating ? parseFloat(data.average_rating) : 0;
      course.ratingCount = data.rating_count || 0;
    }

    return course;
  }

  // Get all courses with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      level,
      search,
      instructorId,
      creatorId,
      categoryId
    } = options;

    let whereConditions = [];
    let params = [];
    let joins = '';

    if (status) {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    if (level) {
      whereConditions.push('c.level = ?');
      params.push(level);
    }

    if (search) {
      whereConditions.push('(c.title LIKE ? OR c.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (instructorId) {
      whereConditions.push('c.instructor_id = ?');
      params.push(instructorId);
    }

    if (creatorId) {
      whereConditions.push('c.creator_id = ?');
      params.push(creatorId);
    }

    if (categoryId) {
      joins += ' INNER JOIN course_categories cc ON c.id = cc.course_id';
      whereConditions.push('cc.category_id = ?');
      params.push(categoryId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseQuery = `
      SELECT c.*, 
             u1.first_name as creator_first_name, u1.last_name as creator_last_name,
             u2.first_name as instructor_first_name, u2.last_name as instructor_last_name,
             u2.email as instructor_email, u2.profile_picture as instructor_profile_picture,
             COUNT(DISTINCT e.id) as enrollment_count,
             COUNT(DISTINCT l.id) as lesson_count,
             AVG(cr.rating) as average_rating
      FROM courses c
      LEFT JOIN users u1 ON c.creator_id = u1.id
      LEFT JOIN users u2 ON c.instructor_id = u2.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN lessons l ON c.id = l.course_id AND l.status = 'PUBLISHED'
      LEFT JOIN course_ratings cr ON c.id = cr.course_id
      ${joins}
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM courses c 
      ${joins}
      ${whereClause}
    `;

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    const courses = result.data.map(courseData => {
      const course = new Course(courseData);
      course.creator = {
        firstName: courseData.creator_first_name,
        lastName: courseData.creator_last_name
      };
      course.instructor = courseData.instructor_id ? {
        id: courseData.instructor_id,
        firstName: courseData.instructor_first_name,
        lastName: courseData.instructor_last_name,
        email: courseData.instructor_email,
        profilePicture: courseData.instructor_profile_picture
      } : null;
      course.enrollmentCount = courseData.enrollment_count || 0;
      course.lessonCount = courseData.lesson_count || 0;
      course.averageRating = courseData.average_rating ? parseFloat(courseData.average_rating) : 0;
      return course;
    });

    return {
      courses,
      pagination: result.pagination
    };
  }

  // Update course
  static async update(id, updateData) {
    const allowedFields = [
      'title', 'description', 'short_description', 'thumbnail', 'cover_image',
      'level', 'status', 'price', 'original_price', 'duration', 'language',
      'tags', 'requirements', 'objectives', 'is_published', 'instructor_id'
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

    // If publishing, set published_at
    if (updateData.isPublished && !updateData.publishedAt) {
      updateFields.push('published_at = CURRENT_TIMESTAMP');
    }

    params.push(id);

    const query = `
      UPDATE courses 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await Course.findById(id, true);
  }

  // Delete course
  static async delete(id) {
    const query = 'DELETE FROM courses WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Add category to course
  static async addCategory(courseId, categoryId) {
    const query = 'INSERT IGNORE INTO course_categories (course_id, category_id) VALUES (?, ?)';
    await executeQuery(query, [courseId, categoryId]);
  }

  // Remove category from course
  static async removeCategory(courseId, categoryId) {
    const query = 'DELETE FROM course_categories WHERE course_id = ? AND category_id = ?';
    await executeQuery(query, [courseId, categoryId]);
  }

  // Get course categories
  static async getCategories(courseId) {
    const query = `
      SELECT c.* 
      FROM categories c
      INNER JOIN course_categories cc ON c.id = cc.category_id
      WHERE cc.course_id = ?
    `;
    return await executeQuery(query, [courseId]);
  }

  // Check if user is enrolled
  static async isUserEnrolled(courseId, userId) {
    const query = 'SELECT id FROM enrollments WHERE course_id = ? AND user_id = ?';
    const results = await executeQuery(query, [courseId, userId]);
    return results.length > 0;
  }

  // Get course statistics
  static async getStatistics() {
    const queries = [
      'SELECT COUNT(*) as total FROM courses',
      'SELECT COUNT(*) as published FROM courses WHERE status = "PUBLISHED"',
      'SELECT COUNT(*) as draft FROM courses WHERE status = "DRAFT"',
      'SELECT AVG(price) as average_price FROM courses WHERE price > 0',
      'SELECT COUNT(DISTINCT e.user_id) as total_students FROM enrollments e'
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query))
    );

    return {
      total: results[0][0].total,
      published: results[1][0].published,
      draft: results[2][0].draft,
      averagePrice: results[3][0].average_price || 0,
      totalStudents: results[4][0].total_students
    };
  }

  // Get popular courses
  static async getPopular(limit = 10) {
    const query = `
      SELECT c.*, COUNT(e.id) as enrollment_count,
             u.first_name as instructor_first_name, u.last_name as instructor_last_name
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN users u ON c.instructor_id = u.id
      WHERE c.status = 'PUBLISHED'
      GROUP BY c.id
      ORDER BY enrollment_count DESC, c.created_at DESC
      LIMIT ?
    `;

    const results = await executeQuery(query, [limit]);
    return results.map(courseData => {
      const course = new Course(courseData);
      course.enrollmentCount = courseData.enrollment_count || 0;
      course.instructor = courseData.instructor_id ? {
        firstName: courseData.instructor_first_name,
        lastName: courseData.instructor_last_name
      } : null;
      return course;
    });
  }
}

module.exports = Course;