/*
  # إنشاء جداول الدروس والاختبارات
  
  1. الجداول الجديدة
    - `lessons` - الدروس مع دعم الترجمة وفيديو لغة الإشارة
    - `quizzes` - الاختبارات
    - `questions` - أسئلة الاختبارات
    - `question_options` - خيارات الأسئلة
      
  2. الأمان
    - تفعيل RLS على جميع الجداول
*/

-- إنشاء أنواع enum
CREATE TYPE lesson_type AS ENUM ('VIDEO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT');
CREATE TYPE lesson_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE quiz_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING');
CREATE TYPE question_type AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK', 'MATCHING');

-- جدول الدروس
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    type lesson_type NOT NULL,
    status lesson_status DEFAULT 'DRAFT',
    order_index INTEGER NOT NULL,
    duration INTEGER,
    video_url TEXT,
    video_thumbnail TEXT,
    captions_url TEXT,
    sign_language_video_url TEXT,
    transcript TEXT,
    materials TEXT,
    is_preview BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_creator ON lessons(creator_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);

-- جدول الاختبارات
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type quiz_type NOT NULL,
    time_limit INTEGER,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    requires_passing BOOLEAN DEFAULT FALSE,
    unlocks_lesson_id UUID,
    is_randomized BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    lesson_id UUID UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes(is_published);

-- جدول الأسئلة
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    type question_type NOT NULL,
    points INTEGER DEFAULT 10,
    explanation TEXT,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);

-- جدول خيارات الأسئلة
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order ON question_options(order_index);

-- تفعيل RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- سياسات الدروس
CREATE POLICY "Published lessons are viewable by everyone"
  ON lessons
  FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

CREATE POLICY "Instructors can view own lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Instructors can create lessons"
  ON lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id 
      AND (creator_id = auth.uid() OR instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors can update own lessons"
  ON lessons
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Instructors can delete own lessons"
  ON lessons
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- سياسات الاختبارات
CREATE POLICY "Published quizzes are viewable by enrolled students"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = lesson_id
    )
  );

CREATE POLICY "Instructors can manage quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons l
      WHERE l.id = lesson_id AND l.creator_id = auth.uid()
    )
  );

-- سياسات الأسئلة
CREATE POLICY "Questions viewable with quiz"
  ON questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = quiz_id AND q.is_published = true
    )
  );

CREATE POLICY "Instructors can manage questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      WHERE q.id = quiz_id AND l.creator_id = auth.uid()
    )
  );

-- سياسات خيارات الأسئلة
CREATE POLICY "Options viewable with questions"
  ON question_options
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions qu
      JOIN quizzes qz ON qu.quiz_id = qz.id
      WHERE qu.id = question_id AND qz.is_published = true
    )
  );

CREATE POLICY "Instructors can manage options"
  ON question_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions qu
      JOIN quizzes qz ON qu.quiz_id = qz.id
      JOIN lessons l ON qz.lesson_id = l.id
      WHERE qu.id = question_id AND l.creator_id = auth.uid()
    )
  );