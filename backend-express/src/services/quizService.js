const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const User = require('../models/User');
const Lesson = require('../models/Lesson');

class QuizService {
  // Create new quiz
  static async createQuiz(quizData, userId) {
    const { courseId, lessonId } = quizData;

    // Check if course exists and user has permission
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to create quiz in this course');
      }
    }

    // If lessonId is provided, check if lesson exists and belongs to the course
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }
      if (lesson.courseId !== courseId) {
        throw new Error('Lesson does not belong to the specified course');
      }
    }

    const validationErrors = this.validateQuizData(quizData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const quiz = await Quiz.create(quizData);
    return await Quiz.findById(quiz.id);
  }

  // Get quiz by ID
  static async getQuizById(quizId, includeQuestions = false, userId = null) {
    const quiz = await Quiz.findById(quizId, includeQuestions);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user can access this quiz
    if (userId) {
      const canTake = await Quiz.canUserTakeQuiz(quizId, userId);
      if (!canTake) {
        throw new Error('Access denied to this quiz');
      }

      // Get user's attempts
      quiz.userAttempts = await Quiz.getUserAttempts(quizId, userId);
    }

    return quiz;
  }

  // Get all quizzes with filters
  static async getAllQuizzes(options = {}) {
    return await Quiz.findAll(options);
  }

  // Get quizzes by course ID
  static async getQuizzesByCourse(courseId, userId = null) {
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

    return await Quiz.findByCourseId(courseId);
  }

  // Get quizzes by lesson ID
  static async getQuizzesByLesson(lessonId, userId = null) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if user can access lesson
    if (userId) {
      const canAccess = await Lesson.canUserAccess(lessonId, userId);
      if (!canAccess) {
        throw new Error('Access denied to this lesson');
      }
    }

    return await Quiz.findByLessonId(lessonId);
  }

  // Update quiz
  static async updateQuiz(quizId, updateData, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check permissions
    const course = await Course.findById(quiz.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update this quiz');
      }
    }

    const validationErrors = this.validateQuizData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Quiz.update(quizId, updateData);
  }

  // Delete quiz
  static async deleteQuiz(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check permissions
    const course = await Course.findById(quiz.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to delete this quiz');
      }
    }

    const deleted = await Quiz.delete(quizId);
    if (!deleted) {
      throw new Error('Failed to delete quiz');
    }

    return { message: 'Quiz deleted successfully' };
  }

  // Add question to quiz
  static async addQuestion(quizId, questionData, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check permissions
    const course = await Course.findById(quiz.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to add questions to this quiz');
      }
    }

    const validationErrors = this.validateQuestionData(questionData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Quiz.addQuestion(quizId, questionData);
  }

  // Update question
  static async updateQuestion(questionId, updateData, userId) {
    const question = await Quiz.getQuestionById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const quiz = await Quiz.findById(question.quizId);
    const course = await Course.findById(quiz.courseId);

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update this question');
      }
    }

    const validationErrors = this.validateQuestionData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Quiz.updateQuestion(questionId, updateData);
  }

  // Delete question
  static async deleteQuestion(questionId, userId) {
    const question = await Quiz.getQuestionById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const quiz = await Quiz.findById(question.quizId);
    const course = await Course.findById(quiz.courseId);

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to delete this question');
      }
    }

    const deleted = await Quiz.deleteQuestion(questionId);
    if (!deleted) {
      throw new Error('Failed to delete question');
    }

    return { message: 'Question deleted successfully' };
  }

  // Add option to question
  static async addOption(questionId, optionData, userId) {
    const question = await Quiz.getQuestionById(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const quiz = await Quiz.findById(question.quizId);
    const course = await Course.findById(quiz.courseId);

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to add options to this question');
      }
    }

    const validationErrors = this.validateOptionData(optionData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Quiz.addOption(questionId, optionData);
  }

  // Update option
  static async updateOption(optionId, updateData, userId) {
    const option = await Quiz.getOptionById(optionId);
    if (!option) {
      throw new Error('Option not found');
    }

    const question = await Quiz.getQuestionById(option.questionId);
    const quiz = await Quiz.findById(question.quizId);
    const course = await Course.findById(quiz.courseId);

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to update this option');
      }
    }

    const validationErrors = this.validateOptionData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    return await Quiz.updateOption(optionId, updateData);
  }

  // Delete option
  static async deleteOption(optionId, userId) {
    const option = await Quiz.getOptionById(optionId);
    if (!option) {
      throw new Error('Option not found');
    }

    const question = await Quiz.getQuestionById(option.questionId);
    const quiz = await Quiz.findById(question.quizId);
    const course = await Course.findById(quiz.courseId);

    // Check permissions
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to delete this option');
      }
    }

    const deleted = await Quiz.deleteOption(optionId);
    if (!deleted) {
      throw new Error('Failed to delete option');
    }

    return { message: 'Option deleted successfully' };
  }

  // Take quiz (create attempt)
  static async takeQuiz(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId, true);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if user can take the quiz
    const canTake = await Quiz.canUserTakeQuiz(quizId, userId);
    if (!canTake) {
      throw new Error('You cannot take this quiz at this time');
    }

    // Validate answers
    const validationErrors = this.validateQuizAnswers(quiz, answers);
    if (validationErrors.length > 0) {
      throw new Error(`Answer validation errors: ${validationErrors.join(', ')}`);
    }

    // Calculate score
    const { score, totalQuestions, correctAnswers } = this.calculateScore(quiz, answers);

    // Create quiz attempt
    const attemptData = {
      quizId,
      userId,
      answers: JSON.stringify(answers),
      score,
      totalQuestions,
      correctAnswers,
      completedAt: new Date()
    };

    const attempt = await Quiz.createAttempt(attemptData);

    return {
      attempt,
      score,
      totalQuestions,
      correctAnswers,
      percentage: Math.round((score / totalQuestions) * 100),
      passed: score >= (quiz.passingScore || 0)
    };
  }

  // Get user's quiz attempts
  static async getUserAttempts(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return await Quiz.getUserAttempts(quizId, userId);
  }

  // Get quiz statistics
  static async getQuizStatistics(quizId = null, courseId = null) {
    return await Quiz.getStatistics(quizId, courseId);
  }

  // Get quiz results for instructor
  static async getQuizResults(quizId, userId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check permissions
    const course = await Course.findById(quiz.courseId);
    if (course.creatorId !== userId && course.instructorId !== userId) {
      const user = await User.findById(userId);
      if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Unauthorized to view quiz results');
      }
    }

    return await Quiz.getQuizResults(quizId);
  }

  // Calculate quiz score
  static calculateScore(quiz, answers) {
    let score = 0;
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && userAnswer === correctOption.id) {
          score += question.points || 1;
          correctAnswers++;
        }
      } else if (question.type === 'MULTIPLE_SELECT') {
        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        if (correctOptions.length === userAnswers.length && 
            correctOptions.every(id => userAnswers.includes(id))) {
          score += question.points || 1;
          correctAnswers++;
        }
      } else if (question.type === 'SHORT_ANSWER') {
        // For short answer, we'll need manual grading or exact match
        const correctAnswer = question.correctAnswer;
        if (correctAnswer && userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          score += question.points || 1;
          correctAnswers++;
        }
      }
    });

    return { score, totalQuestions, correctAnswers };
  }

  // Validate quiz data
  static validateQuizData(data, isUpdate = false) {
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

    if (data.timeLimit !== undefined) {
      if (data.timeLimit < 0) {
        errors.push('Time limit cannot be negative');
      }
    }

    if (data.maxAttempts !== undefined) {
      if (data.maxAttempts < 1) {
        errors.push('Max attempts must be at least 1');
      }
    }

    if (data.passingScore !== undefined) {
      if (data.passingScore < 0) {
        errors.push('Passing score cannot be negative');
      }
    }

    return errors;
  }

  // Validate question data
  static validateQuestionData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.question) {
      if (!data.question || data.question.trim().length < 5) {
        errors.push('Question text must be at least 5 characters long');
      }
    }

    if (data.type) {
      const validTypes = ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER'];
      if (!validTypes.includes(data.type)) {
        errors.push('Invalid question type');
      }
    }

    if (data.points !== undefined) {
      if (data.points < 0) {
        errors.push('Points cannot be negative');
      }
    }

    return errors;
  }

  // Validate option data
  static validateOptionData(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.text) {
      if (!data.text || data.text.trim().length < 1) {
        errors.push('Option text cannot be empty');
      }
    }

    return errors;
  }

  // Validate quiz answers
  static validateQuizAnswers(quiz, answers) {
    const errors = [];

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (question.required && !userAnswer) {
        errors.push(`Answer required for question: ${question.question}`);
        return;
      }

      if (userAnswer) {
        if (question.type === 'MULTIPLE_SELECT') {
          if (!Array.isArray(userAnswer)) {
            errors.push(`Multiple select question requires array of answers: ${question.question}`);
          }
        } else if (question.type === 'SHORT_ANSWER') {
          if (typeof userAnswer !== 'string') {
            errors.push(`Short answer question requires string answer: ${question.question}`);
          }
        }
      }
    });

    return errors;
  }

  // Check if user can take quiz
  static async canUserTakeQuiz(quizId, userId) {
    return await Quiz.canUserTakeQuiz(quizId, userId);
  }

  // Search quizzes
  static async searchQuizzes(query, options = {}) {
    const searchOptions = {
      ...options,
      search: query
    };

    return await Quiz.findAll(searchOptions);
  }
}

module.exports = QuizService;