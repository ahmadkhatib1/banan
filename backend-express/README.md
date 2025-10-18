# Educational Platform Backend - Express.js

منصة تعليمية شاملة مبنية باستخدام Express.js و MySQL، توفر نظام إدارة التعلم الإلكتروني مع ميزات متقدمة للطلاب والمدرسين والإداريين.

## 🚀 الميزات الرئيسية

- **نظام المصادقة والتفويض**: JWT-based authentication مع أدوار متعددة
- **إدارة المستخدمين**: تسجيل، تسجيل دخول، إدارة الملفات الشخصية
- **إدارة الدورات**: إنشاء وتحرير وإدارة الدورات التعليمية
- **نظام الدروس**: دروس تفاعلية مع تتبع التقدم
- **الاختبارات والكويزات**: نظام اختبارات شامل مع تقييم تلقائي
- **تتبع التقدم**: مراقبة تقدم الطلاب وإحصائيات التعلم
- **الأمان المتقدم**: Rate limiting، validation، security headers
- **رفع الملفات**: دعم رفع الملفات مع قيود الأمان

## 📋 متطلبات النظام

- Node.js (v16 أو أحدث)
- MySQL (v8.0 أو أحدث)
- npm أو yarn

## 🛠️ التثبيت والإعداد

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd backend-express
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد قاعدة البيانات MySQL

#### تثبيت MySQL
تأكد من تثبيت MySQL Server على نظامك:
- **Windows**: قم بتحميل MySQL Installer من الموقع الرسمي
- **macOS**: استخدم Homebrew: `brew install mysql`
- **Linux**: استخدم مدير الحزم: `sudo apt install mysql-server`

#### إنشاء قاعدة البيانات
```bash
# تسجيل الدخول إلى MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
CREATE DATABASE edu_les;

# إنشاء مستخدم جديد (اختياري)
CREATE USER 'edu_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON edu_les.* TO 'edu_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. إعداد متغيرات البيئة
```bash
cp .env.example .env
```

قم بتحرير ملف `.env` وإضافة القيم المناسبة:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=edu_les
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. إعداد قاعدة البيانات وإنشاء الجداول
```bash
# تشغيل سكريبت إعداد قاعدة البيانات
npm run setup-db
```

هذا الأمر سيقوم بـ:
- إنشاء قاعدة البيانات إذا لم تكن موجودة
- إنشاء جميع الجداول المطلوبة
- إنشاء مستخدم مسؤول افتراضي
- إضافة فئات افتراضية

### 6. تشغيل المشروع
```bash
# للتطوير
npm run dev

# للإنتاج
npm start 

# لإعادة تعبئة قاعدة البيانات ببيانات تجريبية
npm run seed
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST /api/auth/register
تسجيل مستخدم جديد

**Request Body:**
```json
{
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "STUDENT"
}
```

#### POST /api/auth/login
تسجيل الدخول

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "ahmed@example.com",
      "firstName": "أحمد",
      "lastName": "محمد",
      "role": "STUDENT"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### User Management Endpoints

#### GET /api/users/profile
الحصول على الملف الشخصي للمستخدم الحالي

**Headers:**
```
Authorization: Bearer <access_token>
```

#### PUT /api/users/profile
تحديث الملف الشخصي

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "أحمد المحدث",
  "lastName": "محمد المحدث",
  "bio": "نبذة عن المستخدم"
}
```

### Course Management Endpoints

#### GET /api/courses
الحصول على جميع الدورات

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد العناصر في الصفحة (افتراضي: 10)
- `search`: البحث في العنوان والوصف
- `category`: فلترة حسب الفئة
- `level`: فلترة حسب المستوى

#### POST /api/courses
إنشاء دورة جديدة (للمدرسين فقط)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "دورة البرمجة الأساسية",
  "description": "تعلم أساسيات البرمجة",
  "category": "البرمجة",
  "level": "BEGINNER",
  "price": 99.99,
  "duration": 40
}
```

#### GET /api/courses/:id
الحصول على دورة محددة

#### PUT /api/courses/:id
تحديث دورة (للمدرس المالك فقط)

#### DELETE /api/courses/:id
حذف دورة (للمدرس المالك فقط)

#### POST /api/courses/:id/enroll
التسجيل في دورة

**Headers:**
```
Authorization: Bearer <access_token>
```

### Lesson Management Endpoints

#### GET /api/lessons/course/:courseId
الحصول على دروس دورة محددة

#### POST /api/lessons
إنشاء درس جديد (للمدرسين فقط)

**Request Body:**
```json
{
  "title": "الدرس الأول: مقدمة",
  "content": "محتوى الدرس",
  "courseId": 1,
  "order": 1,
  "duration": 30,
  "type": "VIDEO"
}
```

#### PUT /api/lessons/:id/progress
تحديث تقدم الدرس

**Request Body:**
```json
{
  "progress": 75,
  "timeSpent": 1800
}
```

#### POST /api/lessons/:id/complete
تمييز الدرس كمكتمل

### Quiz Management Endpoints

#### GET /api/quizzes/course/:courseId
الحصول على اختبارات دورة محددة

#### POST /api/quizzes
إنشاء اختبار جديد (للمدرسين فقط)

**Request Body:**
```json
{
  "title": "اختبار الوحدة الأولى",
  "description": "اختبار تقييمي",
  "courseId": 1,
  "lessonId": 1,
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "question": "ما هي لغة البرمجة؟",
      "type": "MULTIPLE_CHOICE",
      "options": [
        {
          "text": "أداة للتواصل مع الحاسوب",
          "isCorrect": true
        },
        {
          "text": "نوع من الألعاب",
          "isCorrect": false
        }
      ],
      "points": 10
    }
  ]
}
```

#### POST /api/quizzes/:id/take
أخذ اختبار

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptions": [1]
    }
  ]
}
```

### Progress Tracking Endpoints

#### GET /api/progress/user
الحصول على تقدم المستخدم الحالي

#### GET /api/progress/course/:courseId
الحصول على تقدم المستخدم في دورة محددة

#### GET /api/progress/statistics
الحصول على إحصائيات التعلم

## 🔒 نظام الأدوار والصلاحيات

### الأدوار المتاحة:
- **STUDENT**: الطلاب - يمكنهم التسجيل في الدورات وأخذ الدروس والاختبارات
- **INSTRUCTOR**: المدرسون - يمكنهم إنشاء وإدارة الدورات والدروس والاختبارات
- **ADMIN**: الإداريون - صلاحيات كاملة لإدارة النظام

### Middleware للمصادقة:
- `auth`: التحقق من وجود token صالح
- `adminAuth`: التحقق من صلاحيات الإدارة
- `instructorAuth`: التحقق من صلاحيات التدريس

## 🛡️ الأمان

### الميزات الأمنية المطبقة:
- **JWT Authentication**: مصادقة آمنة باستخدام JSON Web Tokens
- **Password Hashing**: تشفير كلمات المرور باستخدام bcrypt
- **Rate Limiting**: تحديد معدل الطلبات لمنع الهجمات
- **Input Validation**: التحقق من صحة البيانات المدخلة
- **Security Headers**: إضافة headers أمنية
- **CORS Configuration**: إعداد CORS آمن
- **File Upload Security**: قيود آمنة لرفع الملفات

### Rate Limiting:
- **General**: 100 طلب كل 15 دقيقة
- **Authentication**: 5 محاولات تسجيل دخول كل 15 دقيقة
- **Password Reset**: 3 طلبات إعادة تعيين كلمة مرور كل ساعة

## 📁 هيكل المشروع

```
backend-express/
├── src/
│   ├── config/
│   │   └── database.js          # إعداد قاعدة البيانات
│   ├── middleware/
│   │   ├── auth.js              # مصادقة JWT
│   │   ├── adminAuth.js         # صلاحيات الإدارة
│   │   ├── instructorAuth.js    # صلاحيات التدريس
│   │   ├── validation.js        # التحقق من البيانات
│   │   ├── security.js          # الأمان
│   │   └── errorHandler.js      # معالجة الأخطاء
│   ├── routes/
│   │   ├── auth.js              # مسارات المصادقة
│   │   ├── users.js             # مسارات المستخدمين
│   │   ├── courses.js           # مسارات الدورات
│   │   ├── lessons.js           # مسارات الدروس
│   │   ├── quizzes.js           # مسارات الاختبارات
│   │   └── progress.js          # مسارات التقدم
│   ├── services/
│   │   ├── userService.js       # خدمات المستخدمين
│   │   ├── courseService.js     # خدمات الدورات
│   │   ├── lessonService.js     # خدمات الدروس
│   │   ├── quizService.js       # خدمات الاختبارات
│   │   └── progressService.js   # خدمات التقدم
│   ├── database/
│   │   ├── schema.sql           # مخطط قاعدة البيانات
│   │   └── connection.js        # اتصال قاعدة البيانات
│   └── server.js                # الخادم الرئيسي
├── uploads/                     # مجلد الملفات المرفوعة
├── .env.example                 # مثال متغيرات البيئة
├── package.json
└── README.md
```

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch
```

## 📊 المراقبة والسجلات

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Logging
- **Development**: تسجيل مفصل للطلبات
- **Production**: تسجيل مضغوط للأداء

## 🚀 النشر

### متطلبات الإنتاج:
1. إعداد قاعدة بيانات MySQL
2. تكوين متغيرات البيئة
3. إعداد reverse proxy (nginx)
4. تكوين SSL certificates

### Docker (اختياري):
```bash
# بناء الصورة
docker build -t edu-les-backend .

# تشغيل الحاوية
docker run -p 3000:3000 edu-les-backend
```

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch للميزة الجديدة
3. Commit التغييرات
4. Push إلى البranch
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:
- إنشاء Issue في GitHub
- التواصل عبر البريد الإلكتروني: support@edu-les.com

## 🔄 التحديثات المستقبلية

- [ ] إضافة نظام الإشعارات
- [ ] تطبيق الهاتف المحمول
- [ ] تحليلات متقدمة
- [ ] نظام الدفع المتكامل
- [ ] دعم اللغات المتعددة
- [ ] نظام المناقشات والمنتديات