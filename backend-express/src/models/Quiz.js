const { executeQuery, getPaginatedResults } = require('../config/database');

class Quiz {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.instructions = data.instructions;
    this.timeLimit = data.time_limit;
    this.passingScore = data.passing_score;
    this.maxAttempts = data.max_attempts;
    this.requiresPassing = data.requires_passing;
    this.unlocksLessonId = data.unlocks_lesson_id;
    this.isRandomized = data.is_randomized;
    this.showResults = data.show_results;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.courseId = data.course_id;
    this.lessonId = data.lesson_id;
  }

  // Create new quiz
  static async create(quizData) {
    const {
      title,
      description,
      instructions,
      timeLimit,
      passingScore = 70,
      maxAttempts = 3,
      requiresPassing = false,
      unlocksLessonId = null,
      isRandomized = false,
      showResults = true,
      courseId,
      lessonId
    } = quizData;

    const query = `
      INSERT INTO quizzes (
        title, description, instructions, time_limit, passing_score,
        max_attempts, requires_passing, unlocks_lesson_id, is_randomized, 
        show_results, course_id, lesson_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      title, description, instructions, timeLimit, passingScore,
      maxAttempts, requiresPassing, unlocksLessonId, isRandomized, 
      showResults, courseId, lessonId
    ]);

    return await Quiz.findById(result.insertId);
  }

  // Find quiz by ID
  static async findById(id, includeQuestions = false) {
    let query = `
      SELECT q.*, c.title as course_title, l.title as lesson_title
      FROM quizzes q
      LEFT JOIN courses c ON q.course_id = c.id
      LEFT JOIN lessons l ON q.lesson_id = l.id
      WHERE q.id = ?
    `;

    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const quiz = new Quiz(results[0]);
    quiz.courseTitle = results[0].course_title;
    quiz.lessonTitle = results[0].lesson_title;

    if (includeQuestions) {
      quiz.questions = await Quiz.getQuestions(id);
    }

    return quiz;
  }

  // Get all quizzes with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      courseId,
      lessonId,
      status,
      search
    } = options;

    let whereConditions = [];
    let params = [];

    if (courseId) {
      whereConditions.push('q.course_id = ?');
      params.push(courseId);
    }

    if (lessonId) {
      whereConditions.push('q.lesson_id = ?');
      params.push(lessonId);
    }

    if (status) {
      whereConditions.push('q.status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(q.title LIKE ? OR q.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseQuery = `
      SELECT q.*, c.title as course_title, l.title as lesson_title,
             COUNT(DISTINCT qu.id) as question_count,
             COUNT(DISTINCT qa.id) as attempt_count
      FROM quizzes q
      LEFT JOIN courses c ON q.course_id = c.id
      LEFT JOIN lessons l ON q.lesson_id = l.id
      LEFT JOIN questions qu ON q.id = qu.quiz_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      ${whereClause}
      GROUP BY q.id
      ORDER BY q.updated_at DESC
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT q.id) as total 
      FROM quizzes q 
      LEFT JOIN courses c ON q.course_id = c.id
      LEFT JOIN lessons l ON q.lesson_id = l.id
      ${whereClause}
    `;

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    const quizzes = result.data.map(quizData => {
      const quiz = new Quiz(quizData);
      quiz.courseTitle = quizData.course_title;
      quiz.lessonTitle = quizData.lesson_title;
      quiz.questionCount = quizData.question_count || 0;
      quiz.attemptCount = quizData.attempt_count || 0;
      return quiz;
    });

    return {
      quizzes,
      pagination: result.pagination
    };
  }

  // Update quiz
  static async update(id, updateData) {
    const allowedFields = [
      'title', 'description', 'instructions', 'time_limit', 'passing_score',
      'max_attempts', 'is_randomized', 'show_results', 'status'
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
      UPDATE quizzes 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await Quiz.findById(id);
  }

  // Delete quiz
  static async delete(id) {
    const query = 'DELETE FROM quizzes WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Get quiz questions
  static async getQuestions(quizId, randomize = false) {
    let query = `
      SELECT q.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', qo.id,
                 'text', qo.option_text,
                 'isCorrect', qo.is_correct
               )
             ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.quiz_id = ?
      GROUP BY q.id
      ORDER BY ${randomize ? 'RAND()' : 'q.order'}
    `;

    const results = await executeQuery(query, [quizId]);
    
    return results.map(questionData => ({
      id: questionData.id,
      text: questionData.question_text,
      type: questionData.type,
      points: questionData.points,
      explanation: questionData.explanation,
      order: questionData.order,
      options: JSON.parse(questionData.options || '[]').filter(opt => opt.id !== null)
    }));
  }

  // Add question to quiz
  static async addQuestion(quizId, questionData) {
    const {
      text,
      type = 'MULTIPLE_CHOICE',
      points = 1,
      explanation,
      order,
      options = []
    } = questionData;

    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert question
      const [questionResult] = await connection.execute(
        'INSERT INTO questions (quiz_id, question_text, type, points, explanation, `order`) VALUES (?, ?, ?, ?, ?, ?)',
        [quizId, text, type, points, explanation, order]
      );

      const questionId = questionResult.insertId;

      // Insert options if provided
      if (options.length > 0) {
        for (const option of options) {
          await connection.execute(
            'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
            [questionId, option.text, option.isCorrect || false]
          );
        }
      }

      await connection.commit();
      return questionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Unlock lesson for user after passing quiz
  static async unlockLesson(userId, lessonId) {
    const query = `
      INSERT IGNORE INTO progress (
        user_id, lesson_id, course_id, status, last_accessed_at
      ) 
      SELECT ?, ?, l.course_id, 'NOT_STARTED', CURRENT_TIMESTAMP
      FROM lessons l 
      WHERE l.id = ?
    `;
    
    await executeQuery(query, [userId, lessonId, lessonId]);
  }

  // Check if user has passed a specific quiz
  static async hasUserPassedQuiz(userId, quizId) {
    const query = `
      SELECT COUNT(*) as passed_count
      FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ? AND is_passed = 1
    `;
    
    const results = await executeQuery(query, [userId, quizId]);
    return results[0].passed_count > 0;
  }

  // Get quizzes that unlock a specific lesson
  static async getQuizzesUnlockingLesson(lessonId) {
    const query = `
      SELECT q.*, c.title as course_title
      FROM quizzes q
      LEFT JOIN courses c ON q.course_id = c.id
      WHERE q.unlocks_lesson_id = ? AND q.requires_passing = 1
    `;
    
    const results = await executeQuery(query, [lessonId]);
    return results.map(quizData => new Quiz(quizData));
  }

  // Update question
  static async updateQuestion(questionId, questionData) {
    const {
      text,
      type,
      points,
      explanation,
      order,
      options
    } = questionData;

    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();

      // Update question
      const updateFields = [];
      const params = [];

      if (text !== undefined) {
        updateFields.push('question_text = ?');
        params.push(text);
      }
      if (type !== undefined) {
        updateFields.push('type = ?');
        params.push(type);
      }
      if (points !== undefined) {
        updateFields.push('points = ?');
        params.push(points);
      }
      if (explanation !== undefined) {
        updateFields.push('explanation = ?');
        params.push(explanation);
      }
      if (order !== undefined) {
        updateFields.push('`order` = ?');
        params.push(order);
      }

      if (updateFields.length > 0) {
        params.push(questionId);
        await connection.execute(
          `UPDATE questions SET ${updateFields.join(', ')} WHERE id = ?`,
          params
        );
      }

      // Update options if provided
      if (options && Array.isArray(options)) {
        // Delete existing options
        await connection.execute('DELETE FROM question_options WHERE question_id = ?', [questionId]);
        
        // Insert new options
        for (const option of options) {
          await connection.execute(
            'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
            [questionId, option.text, option.isCorrect || false]
          );
        }
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

  // Delete question
  static async deleteQuestion(questionId) {
    const query = 'DELETE FROM questions WHERE id = ?';
    const result = await executeQuery(query, [questionId]);
    return result.affectedRows > 0;
  }

  // Get user attempts
  static async getUserAttempts(quizId, userId) {
    const query = `
      SELECT * FROM quiz_attempts 
      WHERE quiz_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `;
    
    return await executeQuery(query, [quizId, userId]);
  }

  // Create quiz attempt
  static async createAttempt(quizId, userId, answers) {
    const connection = await require('../config/database').getConnection();
    
    try {
      await connection.beginTransaction();

      // Get quiz details
      const [quizResults] = await connection.execute(
        'SELECT * FROM quizzes WHERE id = ?',
        [quizId]
      );

      if (quizResults.length === 0) {
        throw new Error('Quiz not found');
      }

      const quiz = quizResults[0];

      // Check attempt limit
      const [attemptResults] = await connection.execute(
        'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?',
        [quizId, userId]
      );

      if (attemptResults[0].attempt_count >= quiz.max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }

      // Get questions with correct answers
      const [questions] = await connection.execute(`
        SELECT q.id, q.points,
               JSON_ARRAYAGG(
                 CASE WHEN qo.is_correct = 1 THEN qo.id ELSE NULL END
               ) as correct_options
        FROM questions q
        LEFT JOIN question_options qo ON q.id = qo.question_id
        WHERE q.quiz_id = ?
        GROUP BY q.id
      `, [quizId]);

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach(question => {
        totalPoints += question.points;
        const correctOptions = JSON.parse(question.correct_options).filter(id => id !== null);
        const userAnswers = answers[question.id] || [];
        
        // Simple scoring: all correct options must be selected, no incorrect ones
        const isCorrect = correctOptions.length === userAnswers.length &&
                         correctOptions.every(id => userAnswers.includes(id));
        
        if (isCorrect) {
          earnedPoints += question.points;
        }
      });

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const isPassed = score >= quiz.passing_score;

      // Create attempt record
      const [attemptResult] = await connection.execute(`
        INSERT INTO quiz_attempts (
          quiz_id, user_id, score, is_passed, answers, completed_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [quizId, userId, score, isPassed, JSON.stringify(answers)]);

      // If quiz requires passing and user passed, unlock next lesson
      if (isPassed && quiz.requires_passing && quiz.unlocks_lesson_id) {
        await Quiz.unlockLesson(userId, quiz.unlocks_lesson_id);
      }

      await connection.commit();

      return {
        id: attemptResult.insertId,
        score,
        totalPoints,
        earnedPoints,
        isPassed,
        answers,
        unlockedLesson: isPassed && quiz.unlocks_lesson_id ? quiz.unlocks_lesson_id : null
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get quiz statistics
  static async getStatistics(quizId = null) {
    let whereClause = '';
    let params = [];

    if (quizId) {
      whereClause = 'WHERE quiz_id = ?';
      params.push(quizId);
    }

    const queries = [
      `SELECT COUNT(*) as total FROM quizzes ${whereClause}`,
      `SELECT COUNT(*) as published FROM quizzes ${whereClause} ${quizId ? 'AND' : 'WHERE'} status = 'PUBLISHED'`,
      `SELECT COUNT(DISTINCT qa.user_id) as total_participants FROM quiz_attempts qa ${whereClause ? 'WHERE qa.' + whereClause.substring(6) : ''}`,
      `SELECT AVG(qa.score) as average_score FROM quiz_attempts qa ${whereClause ? 'WHERE qa.' + whereClause.substring(6) : ''}`,
      `SELECT COUNT(*) as passed_attempts FROM quiz_attempts qa ${whereClause ? 'WHERE qa.' + whereClause.substring(6) + ' AND' : 'WHERE'} qa.passed = 1`
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query, params))
    );

    return {
      total: results[0][0].total,
      published: results[1][0].published,
      totalParticipants: results[2][0].total_participants,
      averageScore: results[3][0].average_score || 0,
      passedAttempts: results[4][0].passed_attempts
    };
  }

  // Check if user can take quiz
  static async canUserTakeQuiz(quizId, userId) {
    const query = `
      SELECT q.max_attempts, q.status, q.course_id,
             COUNT(qa.id) as attempt_count,
             e.id as enrollment_id
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.user_id = ?
      LEFT JOIN enrollments e ON q.course_id = e.course_id AND e.user_id = ?
      WHERE q.id = ?
      GROUP BY q.id
    `;

    const results = await executeQuery(query, [userId, userId, quizId]);
    
    if (results.length === 0) {
      return { canTake: false, reason: 'Quiz not found' };
    }

    const quiz = results[0];

    if (quiz.status !== 'PUBLISHED') {
      return { canTake: false, reason: 'Quiz not published' };
    }

    if (!quiz.enrollment_id) {
      return { canTake: false, reason: 'Not enrolled in course' };
    }

    if (quiz.attempt_count >= quiz.max_attempts) {
      return { canTake: false, reason: 'Maximum attempts exceeded' };
    }

    return { canTake: true, attemptsLeft: quiz.max_attempts - quiz.attempt_count };
  }
}

module.exports = Quiz;