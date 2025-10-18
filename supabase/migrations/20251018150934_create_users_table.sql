/*
  # إنشاء جدول المستخدمين
  
  1. الجداول الجديدة
    - `users` - جدول المستخدمين مع جميع الحقول المطلوبة
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `username` (text, unique)
      - `first_name`, `last_name` (text)
      - `role` (enum: STUDENT, INSTRUCTOR, CONTENT_ADMIN, SUPER_ADMIN)
      - `status` (enum: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION)
      - `password` (text, hashed)
      - معلومات إضافية (avatar, profile_picture, date_of_birth, etc.)
      
  2. الأمان
    - تفعيل RLS على جدول users
    - إضافة سياسات للقراءة والتحديث
*/

-- إنشاء نوع enum للأدوار
CREATE TYPE user_role AS ENUM ('STUDENT', 'INSTRUCTOR', 'CONTENT_ADMIN', 'SUPER_ADMIN');

-- إنشاء نوع enum لحالة المستخدم
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar TEXT,
    profile_picture TEXT,
    date_of_birth DATE,
    role user_role DEFAULT 'STUDENT',
    status user_status DEFAULT 'PENDING_VERIFICATION',
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    password TEXT NOT NULL,
    refresh_token TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    grade TEXT,
    parent_email TEXT,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- السياسات الأمنية
-- المستخدمون يمكنهم قراءة بياناتهم فقط
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- المستخدمون يمكنهم تحديث بياناتهم فقط
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- المسؤولون يمكنهم قراءة جميع المستخدمين
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'CONTENT_ADMIN')
    )
  );

-- السماح بالتسجيل (INSERT للجميع بدون مصادقة)
CREATE POLICY "Allow public registration"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);