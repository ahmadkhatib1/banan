/*
  # إنشاء جداول الفئات والدورات
  
  1. الجداول الجديدة
    - `categories` - فئات الدورات
    - `courses` - الدورات التعليمية
    - `course_categories` - جدول ربط بين الدورات والفئات
      
  2. الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للقراءة العامة والتعديل للمدربين
*/

-- إنشاء نوع enum لمستوى الدورة
CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- إنشاء نوع enum لحالة الدورة
CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- جدول الدورات
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    thumbnail TEXT,
    cover_image TEXT,
    level course_level NOT NULL,
    status course_status DEFAULT 'DRAFT',
    price DECIMAL(10, 2) DEFAULT 0.00,
    original_price DECIMAL(10, 2),
    duration INTEGER,
    language TEXT DEFAULT 'ar',
    tags TEXT,
    requirements TEXT,
    objectives TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_creator ON courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);

-- جدول ربط الدورات بالفئات
CREATE TABLE IF NOT EXISTS course_categories (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, category_id)
);

-- تفعيل RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

-- سياسات الفئات - قراءة عامة
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- سياسات الدورات - قراءة عامة للمنشورة
CREATE POLICY "Published courses are viewable by everyone"
  ON courses
  FOR SELECT
  TO authenticated, anon
  USING (is_published = true);

-- المدربون يمكنهم رؤية دوراتهم
CREATE POLICY "Instructors can view own courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid() OR instructor_id = auth.uid());

-- المدربون يمكنهم إنشاء دورات
CREATE POLICY "Instructors can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND role IN ('INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN')
    )
  );

-- المدربون يمكنهم تحديث دوراتهم
CREATE POLICY "Instructors can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() OR instructor_id = auth.uid())
  WITH CHECK (creator_id = auth.uid() OR instructor_id = auth.uid());

-- المدربون يمكنهم حذف دوراتهم
CREATE POLICY "Instructors can delete own courses"
  ON courses
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- سياسات course_categories
CREATE POLICY "Course categories are viewable by everyone"
  ON course_categories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Instructors can manage course categories"
  ON course_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE id = course_id 
      AND (creator_id = auth.uid() OR instructor_id = auth.uid())
    )
  );