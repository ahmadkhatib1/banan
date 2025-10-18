-- Educational Platform Database Schema
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS edu_les CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edu_les;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    profile_picture VARCHAR(500),
    date_of_birth DATE,
    role ENUM('STUDENT', 'INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN') DEFAULT 'STUDENT',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') DEFAULT 'PENDING_VERIFICATION',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    grade VARCHAR(50),
    parent_email VARCHAR(255),
    preferences JSON,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

CREATE TABLE  user_code (
    id                  VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id 		    VARCHAR(36)  NULL,
    email               VARCHAR(255) NULL,
    code                VARCHAR(255) NOT NULL UNIQUE,
    type                ENUM('ACTIVATE', 'RESET_PASS', 'CONFIRM') NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    create_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date_time    DATETIME NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE RESTRICT 
)


-- Categories table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Courses table
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    thumbnail VARCHAR(500),
    cover_image VARCHAR(500),
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    price DECIMAL(10, 2) DEFAULT 0.00,
    original_price DECIMAL(10, 2),
    duration INT, -- in minutes
    language VARCHAR(10) DEFAULT 'ar',
    tags TEXT, -- comma-separated
    requirements TEXT, -- comma-separated
    objectives TEXT, -- comma-separated
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    creator_id VARCHAR(36) NOT NULL,
    instructor_id VARCHAR(36),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_title (title),
    INDEX idx_status (status),
    INDEX idx_level (level),
    INDEX idx_creator (creator_id),
    INDEX idx_instructor (instructor_id),
    INDEX idx_published (is_published)
);

-- Course Categories junction table
CREATE TABLE course_categories (
    course_id VARCHAR(36),
    category_id VARCHAR(36),
    PRIMARY KEY (course_id, category_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Lessons table
CREATE TABLE lessons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    type ENUM('VIDEO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT') NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    order_index INT NOT NULL,
    duration INT, -- in minutes
    video_url VARCHAR(500),
    video_thumbnail VARCHAR(500),
    captions_url VARCHAR(500), -- WebVTT/SRT file URL
    sign_language_video_url VARCHAR(500), -- Sign language interpreter video
    transcript TEXT, -- Full lesson transcript
    materials TEXT, -- comma-separated URLs
    is_preview BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    course_id VARCHAR(36) NOT NULL,
    creator_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_creator (creator_id),
    INDEX idx_order (order_index),
    INDEX idx_status (status),
    INDEX idx_published (is_published)
);

-- Quizzes table
CREATE TABLE quizzes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING') NOT NULL,
    time_limit INT, -- in minutes
    passing_score INT DEFAULT 70, -- percentage
    max_attempts INT DEFAULT 3,
    requires_passing BOOLEAN DEFAULT FALSE, -- Does this quiz need to be passed to unlock next lesson
    unlocks_lesson_id INT, -- Which lesson this quiz unlocks when passed
    is_randomized BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lesson_id VARCHAR(36) UNIQUE NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id),
    INDEX idx_published (is_published)
);

-- Questions table
CREATE TABLE questions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    text TEXT NOT NULL,
    type ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING') NOT NULL,
    points INT DEFAULT 10,
    explanation TEXT,
    order_index INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    quiz_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_order (order_index)
);

-- Question Options table
CREATE TABLE question_options (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    question_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id),
    INDEX idx_order (order_index)
);

-- Enrollments table
CREATE TABLE enrollments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    status ENUM('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED') DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP NULL,
    progress_percent DECIMAL(5, 2) DEFAULT 0.00,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
);

-- Progress table
CREATE TABLE progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED',
    completed_at TIMESTAMP NULL,
    time_spent INT DEFAULT 0, -- in seconds
    last_accessed_at TIMESTAMP NULL,
    watch_time INT DEFAULT 0, -- in seconds for video lessons
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36) NOT NULL,
    UNIQUE KEY unique_progress (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_status (status)
);

-- Quiz Attempts table
CREATE TABLE quiz_attempts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    answers JSON NOT NULL,
    score INT NOT NULL,
    is_passed BOOLEAN DEFAULT FALSE, -- Whether this attempt passed the quiz
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent INT, -- in seconds
    quiz_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_user (user_id),
    INDEX idx_score (score),
    INDEX idx_passed (is_passed)
);

-- Course Ratings table
CREATE TABLE course_ratings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    UNIQUE KEY unique_rating (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_rating (rating)
);

-- Achievements table
CREATE TABLE achievements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., "course_completion", "streak", "quiz_master"
    criteria JSON NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type)
);

-- Certificates table
CREATE TABLE certificates (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id)
);

-- Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('COURSE_UPDATE', 'LESSON_REMINDER', 'ACHIEVEMENT', 'PARENT_REPORT', 'SYSTEM') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read)
);

-- Activity Logs table
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    action VARCHAR(255) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- Uploaded Files table
CREATE TABLE uploaded_files (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INT NOT NULL, -- in bytes
    path VARCHAR(500) NOT NULL,
    url VARCHAR(500),
    type ENUM('VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO') NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NOT NULL,
    lesson_id VARCHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_lesson (lesson_id),
    INDEX idx_type (type)
);

-- Parent-Child relationship table
CREATE TABLE user_relationships (
    parent_id VARCHAR(36),
    child_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (parent_id, child_id),
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE
);
