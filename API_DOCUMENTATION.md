# 📚 توثيق واجهات برمجة التطبيقات - منصة التعلم الإلكتروني

## 🌟 الميزات الجديدة المضافة

### 1. دعم الترجمة وفيديو لغة الإشارة
- إضافة حقول جديدة للدروس:
-  `captions_url`, `sign_language_video_url`, `transcript`
- دعم ملفات WebVTT/SRT للترجمة
- دعم فيديو لغة الإشارة لتحسين إمكانية الوصول
### 2. التسلسل الصارم للدروس
- منع الوصول للدروس قبل إكمال الدروس السابقة
- التحقق من التسجيل في الدورة
- دعم الدروس المجانية
### 3. ربط الاختبارات بفتح الدروس
- إمكانية ربط اختبار بدرس معين لفتحه عند النجاح
- تتبع حالة النجاح/الرسوب في الاختبارات
- دعم الترتيب العشوائي للأسئلة
---

## 🔐 المصادقة والتفويض

### نقاط النهاية للمصادقة (`/api/auth`)

| الطريقة | المسار | الوصف | المصادقة |
|---------|-------|-------|----------|
| POST | `/register` | تسجيل مستخدم جديد | لا |
| POST | `/login` | تسجيل الدخول | لا |
| POST | `/refresh` | تحديث الرمز المميز | لا |
| POST | `/logout` | تسجيل الخروج | ✅ |
| GET | `/profile` | الحصول على الملف الشخصي | ✅ |
| PUT | `/profile` | تحديث الملف الشخصي | ✅ |
| PUT | `/change-password` | تغيير كلمة المرور | ✅ |
| POST | `/forgot-password` | نسيان كلمة المرور | لا |
| POST | `/reset-password` | إعادة تعيين كلمة المرور | لا |
| POST | `/verify-email` | تأكيد البريد الإلكتروني | لا |
| POST | `/resend-verification` | إعادة إرسال رمز التأكيد | ✅ |
| GET | `/me` | معلومات المستخدم الحالي | ✅ |

---

## 👥 إدارة المستخدمين

### نقاط النهاية للمستخدمين (`/api/users`)

| الطريقة | المسار | الوصف | المصادقة | الصلاحية |
|---------|-------|-------|----------|----------|
| GET | `/` | قائمة المستخدمين | ✅ | Admin |
| GET | `/search` | البحث في المستخدمين | ✅ | Admin |
| GET | `/statistics` | إحصائيات المستخدمين | ✅ | Admin |
| GET | `/:id` | تفاصيل مستخدم | ✅ | - |
| PUT | `/:id` | تحديث مستخدم | ✅ | - |
| DELETE | `/:id` | حذف مستخدم | ✅ | Admin |
| PUT | `/:id/status` | تغيير حالة المستخدم | ✅ | Admin |
| PUT | `/:id/role` | تغيير دور المستخدم | ✅ | Admin |
| GET | `/:id/dashboard` | لوحة تحكم المستخدم | ✅ | - |
| GET | `/:id/courses` | دورات المستخدم | ✅ | - |
| GET | `/:id/progress` | تقدم المستخدم | ✅ | - |
| POST | `/:id/verify-email` | تأكيد بريد المستخدم | ✅ | Admin |
| POST | `/bulk-action` | إجراءات جماعية | ✅ | Admin |

---

## 📖 إدارة الدورات

### نقاط النهاية للدورات (`/api/courses`)

| الطريقة | المسار | الوصف | المصادقة | الصلاحية |
|---------|-------|-------|----------|----------|
| GET | `/` | قائمة الدورات | لا | - |
| GET | `/popular` | الدورات الشائعة | لا | - |
| GET | `/search` | البحث في الدورات | لا | - |
| GET | `/my-courses` | دوراتي | ✅ | Instructor |
| POST | `/` | إنشاء دورة جديدة | ✅ | Instructor |
| GET | `/:id` | تفاصيل الدورة | لا | - |
| PUT | `/:id` | تحديث الدورة | ✅ | Instructor |
| DELETE | `/:id` | حذف الدورة | ✅ | Instructor |
| POST | `/:id/enroll` | التسجيل في الدورة | ✅ | - |
| POST | `/:id/unenroll` | إلغاء التسجيل | ✅ | - |
| GET | `/:id/lessons` | دروس الدورة | لا | - |
| GET | `/:id/quizzes` | اختبارات الدورة | لا | - |
| POST | `/:id/rate` | تقييم الدورة | ✅ | - |
| GET | `/:id/ratings` | تقييمات الدورة | لا | - |
| PUT | `/:id/publish` | نشر الدورة | ✅ | Instructor |
| PUT | `/:id/unpublish` | إلغاء نشر الدورة | ✅ | Instructor |
| GET | `/:id/students` | طلاب الدورة | ✅ | Instructor |
| GET | `/:id/analytics` | تحليلات الدورة | ✅ | Instructor |
| POST | `/:id/categories` | إضافة فئة للدورة | ✅ | Instructor |
| DELETE | `/:id/categories/:categoryId` | حذف فئة من الدورة | ✅ | Instructor |

---

## 📝 إدارة الدروس (مع الميزات الجديدة)

### نقاط النهاية للدروس (`/api/lessons`)

| الطريقة | المسار | الوصف | المصادقة | الصلاحية | الميزات الجديدة |
|---------|-------|-------|----------|----------|----------------|
| GET | `/` | قائمة الدروس | ✅ | - | - |
| GET | `/course/:courseId` | دروس الدورة | ✅ | - | - |
| POST | `/` | إنشاء درس جديد | ✅ | Instructor | ✨ دعم الترجمة وفيديو لغة الإشارة |
| GET | `/:id` | تفاصيل الدرس | ✅ | - | ✨ عرض الترجمة وفيديو لغة الإشارة |
| PUT | `/:id` | تحديث الدرس | ✅ | Instructor | ✨ تحديث الترجمة وفيديو لغة الإشارة |
| DELETE | `/:id` | حذف الدرس | ✅ | Instructor | - |
| POST | `/:id/progress` | تحديث التقدم | ✅ | - | - |
| POST | `/:id/complete` | إكمال الدرس | ✅ | - | - |
| GET | `/:id/progress` | تقدم الدرس | ✅ | - | - |
| GET | `/:id/next` | الدرس التالي | ✅ | - | ✨ التحقق من التسلسل الصارم |
| GET | `/:id/previous` | الدرس السابق | ✅ | - | - |
| GET | `/course/:courseId/current` | الدرس الحالي | ✅ | - | ✨ التحقق من التسلسل |
| PUT | `/course/:courseId/reorder` | إعادة ترتيب الدروس | ✅ | Instructor | - |
| GET | `/statistics` | إحصائيات الدروس | ✅ | Instructor | - |
| GET | `/:id/completion-rate` | معدل الإكمال | ✅ | Instructor | - |
| GET | `/search` | البحث في الدروس | ✅ | - | - |
| GET | `/:id/resources` | موارد الدرس | ✅ | - | - |
| PUT | `/:id/resources` | تحديث الموارد | ✅ | Instructor | - |
| GET | `/:id/can-access` | التحقق من إمكانية الوصول | ✅ | - | ✨ التحقق من التسلسل والاختبارات |

### الحقول الجديدة للدروس:
```json
{
  "captions_url": "https://example.com/captions.vtt",
  "sign_language_video_url": "https://example.com/sign_language.mp4",
  "transcript": "النص المكتوب للدرس..."
}
```

---

## 🧪 إدارة الاختبارات (مع الميزات الجديدة)

### نقاط النهاية للاختبارات (`/api/quizzes`)

| الطريقة | المسار | الوصف | المصادقة | الصلاحية | الميزات الجديدة |
|---------|-------|-------|----------|----------|----------------|
| GET | `/` | قائمة الاختبارات | ✅ | - | - |
| GET | `/course/:courseId` | اختبارات الدورة | ✅ | - | - |
| GET | `/lesson/:lessonId` | اختبارات الدرس | ✅ | - | - |
| POST | `/` | إنشاء اختبار جديد | ✅ | Instructor | ✨ ربط بفتح الدروس |
| GET | `/:id` | تفاصيل الاختبار | ✅ | - | ✨ عرض الدرس المرتبط |
| PUT | `/:id` | تحديث الاختبار | ✅ | Instructor | ✨ تحديث الربط بالدروس |
| DELETE | `/:id` | حذف الاختبار | ✅ | Instructor | - |
| POST | `/:id/questions` | إضافة سؤال | ✅ | Instructor | - |
| PUT | `/:quizId/questions/:questionId` | تحديث سؤال | ✅ | Instructor | - |
| DELETE | `/:quizId/questions/:questionId` | حذف سؤال | ✅ | Instructor | - |
| POST | `/:id/take` | أداء الاختبار | ✅ | - | ✨ فتح الدرس عند النجاح |
| GET | `/:id/attempts` | محاولات الاختبار | ✅ | - | ✨ عرض حالة النجاح |
| GET | `/:id/can-take` | التحقق من إمكانية الأداء | ✅ | - | - |
| GET | `/:id/statistics` | إحصائيات الاختبار | ✅ | Instructor | - |
| GET | `/:id/results` | نتائج الاختبار | ✅ | Instructor | - |
| GET | `/:quizId/attempts/:attemptId` | تفاصيل المحاولة | ✅ | - | ✨ حالة النجاح |
| PUT | `/:id/publish` | نشر الاختبار | ✅ | Instructor | - |
| PUT | `/:id/unpublish` | إلغاء نشر الاختبار | ✅ | Instructor | - |
| POST | `/:id/duplicate` | نسخ الاختبار | ✅ | Instructor | - |
| PUT | `/:id/questions/reorder` | إعادة ترتيب الأسئلة | ✅ | Instructor | - |
| GET | `/search` | البحث في الاختبارات | ✅ | - | - |

### الحقول الجديدة للاختبارات:
```json
{
  "requires_passing": true,
  "unlocks_lesson_id": 123,
  "is_randomized": true
}
```

### الحقول الجديدة لمحاولات الاختبار:
```json
{
  "is_passed": true,
  "unlocked_lesson": {
    "id": 123,
    "title": "الدرس التالي"
  }
}
```

---

## 📊 إدارة التقدم (مع الميزات الجديدة)

### نقاط النهاية للتقدم (`/api/progress`)

| الطريقة | المسار | الوصف | المصادقة | الصلاحية | الميزات الجديدة |
|---------|-------|-------|----------|----------|----------------|
| GET | `/` | تقدم المستخدم | ✅ | - | - |
| POST | `/` | تحديث التقدم | ✅ | - | - |
| POST | `/complete` | إكمال درس | ✅ | - | ✨ التحقق من التسلسل |
| GET | `/lesson/:lessonId` | تقدم درس محدد | ✅ | - | - |
| GET | `/course/:courseId` | تقدم الدورة | ✅ | - | - |
| GET | `/course/:courseId/summary` | ملخص تقدم الدورة | ✅ | - | - |
| GET | `/statistics` | إحصائيات التقدم | ✅ | - | - |
| GET | `/recent-activity` | النشاط الأخير | ✅ | - | - |
| GET | `/leaderboard` | لوحة المتصدرين | ✅ | - | - |
| GET | `/course/:courseId/next-lesson` | الدرس التالي | ✅ | - | ✨ التحقق من التسلسل والاختبارات |
| GET | `/course/:courseId/completed` | التحقق من إكمال الدورة | ✅ | - | - |
| DELETE | `/lesson/:lessonId` | حذف تقدم درس | ✅ | - | - |
| DELETE | `/course/:courseId` | حذف تقدم دورة | ✅ | - | - |
| POST | `/bulk` | تحديث جماعي للتقدم | ✅ | - | - |
| GET | `/learning-path` | مسار التعلم | ✅ | - | ✨ مع التسلسل الصارم |
| GET | `/trends` | اتجاهات التعلم | ✅ | - | - |
| GET | `/analytics/course/:courseId` | تحليلات الدورة | ✅ | Instructor | - |
| GET | `/analytics/lesson/:lessonId` | تحليلات الدرس | ✅ | Instructor | - |
| GET | `/course/:courseId/students` | طلاب الدورة | ✅ | Instructor | - |
| GET | `/engagement/course/:courseId` | مشاركة الطلاب | ✅ | Instructor | - |
| GET | `/user/:userId` | تقدم مستخدم محدد | ✅ | Admin | - |
| DELETE | `/user/:userId/course/:courseId` | حذف تقدم مستخدم | ✅ | Admin | - |

---

## 🎯 السيناريوهات الجديدة

### 1. سيناريو دعم الترجمة وفيديو لغة الإشارة

#### إنشاء درس مع دعم إمكانية الوصول:
```http
POST /api/lessons
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "مقدمة في البرمجة",
  "description": "درس تمهيدي في أساسيات البرمجة",
  "courseId": 1,
  "type": "VIDEO",
  "video_url": "https://example.com/video.mp4",
  "captions_url": "https://example.com/captions.vtt",
  "sign_language_video_url": "https://example.com/sign_language.mp4",
  "transcript": "مرحباً بكم في درس البرمجة..."
}
```

#### الحصول على درس مع الترجمة:
```http
GET /api/lessons/123
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 123,
    "title": "مقدمة في البرمجة",
    "video_url": "https://example.com/video.mp4",
    "captions_url": "https://example.com/captions.vtt",
    "sign_language_video_url": "https://example.com/sign_language.mp4",
    "transcript": "مرحباً بكم في درس البرمجة..."
  }
}
```

### 2. سيناريو التسلسل الصارم للدروس

#### التحقق من إمكانية الوصول للدرس:
```http
GET /api/lessons/456/can-access
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "PREVIOUS_LESSON_NOT_COMPLETED",
    "requiredLesson": {
      "id": 455,
      "title": "الدرس السابق"
    }
  }
}
```

#### الحصول على الدرس التالي المتاح:
```http
GET /api/lessons/123/next
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "nextLesson": {
      "id": 124,
      "title": "الدرس التالي",
      "canAccess": true
    }
  }
}
```

### 3. سيناريو ربط الاختبارات بفتح الدروس

#### إنشاء اختبار يفتح درساً عند النجاح:
```http
POST /api/quizzes
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "اختبار الوحدة الأولى",
  "description": "اختبار تقييمي للوحدة الأولى",
  "courseId": 1,
  "passingScore": 70,
  "requires_passing": true,
  "unlocks_lesson_id": 125,
  "is_randomized": true
}
```

#### أداء اختبار وفتح الدرس:
```http
POST /api/quizzes/789/take
Content-Type: application/json
Authorization: Bearer {token}

{
  "answers": [
    {"questionId": 1, "answer": "A"},
    {"questionId": 2, "answer": "B"}
  ]
}

Response:
{
  "success": true,
  "data": {
    "score": 85,
    "passed": true,
    "is_passed": true,
    "unlocked_lesson": {
      "id": 125,
      "title": "الدرس المفتوح حديثاً"
    }
  }
}
```

#### التحقق من الاختبارات المطلوبة للدرس:
```http
GET /api/lessons/125/can-access
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "QUIZ_NOT_PASSED",
    "requiredQuizzes": [
      {
        "id": 789,
        "title": "اختبار الوحدة الأولى",
        "passed": false
      }
    ]
  }
}
```

---

## 🔧 رموز الاستجابة

| الرمز | الوصف |
|-------|-------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | خطأ في البيانات المرسلة |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 409 | تعارض في البيانات |
| 500 | خطأ في الخادم |

---

## 🚀 الخادم

- **URL الأساسي**: `http://localhost:5000`
- **فحص الصحة**: `http://localhost:5000/health`
- **توثيق Swagger**: `http://localhost:5000/api`

---

## 📋 ملاحظات مهمة

1. **المصادقة**: معظم نقاط النهاية تتطلب رمز JWT في header `Authorization: Bearer {token}`
2. **الصلاحيات**: 
   - `Admin`: صلاحيات إدارية كاملة
   - `Instructor`: إنشاء وإدارة المحتوى
   - `Student`: الوصول للمحتوى والتعلم
3. **التسلسل**: الدروس تتبع ترتيباً صارماً ما لم تكن مجانية
4. **الاختبارات**: يمكن ربطها بفتح دروس معينة عند النجاح
5. **إمكانية الوصول**: دعم كامل للترجمة وفيديو لغة الإشارة

---

