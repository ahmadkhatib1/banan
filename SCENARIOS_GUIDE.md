# 🎯 دليل السيناريوهات - منصة التعلم الإلكتروني

## 📖 نظرة عامة

هذا الدليل يوضح السيناريوهات المختلفة لاستخدام الميزات الجديدة في منصة التعلم الإلكتروني، بما في ذلك دعم إمكانية الوصول، التسلسل الصارم للدروس، وربط الاختبارات بفتح الدروس.

---

## 🎬 سيناريوهات دعم الترجمة وفيديو لغة الإشارة

### السيناريو 1: إنشاء درس مع دعم كامل لإمكانية الوصول

**الهدف**: إنشاء درس يدعم الطلاب ذوي الاحتياجات الخاصة

**الخطوات**:

1. **إنشاء الدرس الأساسي**:
```http
POST /api/lessons
{
  "title": "أساسيات الرياضيات",
  "description": "مقدمة في العمليات الحسابية الأساسية",
  "courseId": 1,
  "type": "VIDEO",
  "video_url": "https://cdn.example.com/math-basics.mp4"
}
```

2. **إضافة ملف الترجمة (WebVTT)**:
```http
PUT /api/lessons/123
{
  "captions_url": "https://cdn.example.com/math-basics-ar.vtt"
}
```

3. **إضافة فيديو لغة الإشارة**:
```http
PUT /api/lessons/123
{
  "sign_language_video_url": "https://cdn.example.com/math-basics-sign.mp4"
}
```

4. **إضافة النص المكتوب**:
```http
PUT /api/lessons/123
{
  "transcript": "مرحباً بكم في درس أساسيات الرياضيات. سنتعلم اليوم العمليات الأربع الأساسية..."
}
```

**النتيجة المتوقعة**: درس يدعم جميع أنواع المتعلمين مع إمكانية الوصول الكاملة.

### السيناريو 2: عرض الدرس للطالب مع خيارات إمكانية الوصول

**الهدف**: عرض الدرس مع جميع خيارات إمكانية الوصول

**الخطوات**:

1. **الحصول على تفاصيل الدرس**:
```http
GET /api/lessons/123
Authorization: Bearer {student_token}
```

2. **الاستجابة المتوقعة**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "أساسيات الرياضيات",
    "video_url": "https://cdn.example.com/math-basics.mp4",
    "captions_url": "https://cdn.example.com/math-basics-ar.vtt",
    "sign_language_video_url": "https://cdn.example.com/math-basics-sign.mp4",
    "transcript": "مرحباً بكم في درس أساسيات الرياضيات...",
    "accessibility_features": {
      "has_captions": true,
      "has_sign_language": true,
      "has_transcript": true
    }
  }
}
```

3. **عرض الخيارات في واجهة المستخدم**:
   - زر تشغيل/إيقاف الترجمة
   - زر عرض فيديو لغة الإشارة
   - زر عرض النص المكتوب

### السيناريو 3: تحديث محتوى إمكانية الوصول

**الهدف**: تحديث ملفات الترجمة أو فيديو لغة الإشارة

**الخطوات**:

1. **تحديث ملف الترجمة**:
```http
PUT /api/lessons/123
{
  "captions_url": "https://cdn.example.com/math-basics-ar-v2.vtt"
}
```

2. **تحديث فيديو لغة الإشارة**:
```http
PUT /api/lessons/123
{
  "sign_language_video_url": "https://cdn.example.com/math-basics-sign-v2.mp4"
}
```

3. **تحديث النص المكتوب**:
```http
PUT /api/lessons/123
{
  "transcript": "النسخة المحدثة من النص المكتوب..."
}
```

---

## 🔒 سيناريوهات التسلسل الصارم للدروس

### السيناريو 1: طالب جديد يحاول الوصول لدرس متقدم

**الهدف**: منع الطالب من تخطي الدروس الأساسية

**الخطوات**:

1. **محاولة الوصول للدرس**:
```http
GET /api/lessons/105/can-access
Authorization: Bearer {student_token}
```

2. **الاستجابة - منع الوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "PREVIOUS_LESSON_NOT_COMPLETED",
    "requiredLesson": {
      "id": 104,
      "title": "المتغيرات في البرمجة",
      "completed": false
    },
    "message": "يجب إكمال الدرس السابق أولاً"
  }
}
```

3. **توجيه الطالب للدرس المطلوب**:
```http
GET /api/lessons/104
Authorization: Bearer {student_token}
```

### السيناريو 2: إكمال درس وفتح الدرس التالي

**الهدف**: السماح بالوصول للدرس التالي بعد إكمال الحالي

**الخطوات**:

1. **إكمال الدرس الحالي**:
```http
POST /api/lessons/104/complete
Authorization: Bearer {student_token}
```

2. **الاستجابة - تأكيد الإكمال**:
```json
{
  "success": true,
  "data": {
    "lessonId": 104,
    "completed": true,
    "completedAt": "2024-01-15T10:30:00Z",
    "nextLesson": {
      "id": 105,
      "title": "الحلقات في البرمجة",
      "unlocked": true
    }
  }
}
```

3. **التحقق من إمكانية الوصول للدرس التالي**:
```http
GET /api/lessons/105/can-access
Authorization: Bearer {student_token}
```

4. **الاستجابة - السماح بالوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "reason": "PREVIOUS_LESSON_COMPLETED",
    "message": "يمكنك الآن الوصول لهذا الدرس"
  }
}
```

### السيناريو 3: الوصول لدرس مجاني

**الهدف**: السماح بالوصول للدروس المجانية بدون قيود

**الخطوات**:

1. **محاولة الوصول لدرس مجاني**:
```http
GET /api/lessons/201/can-access
Authorization: Bearer {student_token}
```

2. **الاستجابة - السماح بالوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "reason": "FREE_LESSON",
    "message": "هذا درس مجاني متاح للجميع"
  }
}
```

### السيناريو 4: طالب غير مسجل في الدورة

**الهدف**: منع الوصول للدروس للطلاب غير المسجلين

**الخطوات**:

1. **محاولة الوصول للدرس**:
```http
GET /api/lessons/103/can-access
Authorization: Bearer {student_token}
```

2. **الاستجابة - منع الوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "NOT_ENROLLED",
    "course": {
      "id": 1,
      "title": "دورة البرمجة الأساسية"
    },
    "message": "يجب التسجيل في الدورة أولاً"
  }
}
```

---

## 🧪 سيناريوهات ربط الاختبارات بفتح الدروس

### السيناريو 1: إنشاء اختبار يفتح درساً عند النجاح

**الهدف**: ربط اختبار بدرس معين يفتح عند النجاح

**الخطوات**:

1. **إنشاء الاختبار**:
```http
POST /api/quizzes
{
  "title": "اختبار أساسيات البرمجة",
  "description": "اختبار تقييمي للوحدة الأولى",
  "courseId": 1,
  "passingScore": 70,
  "requires_passing": true,
  "unlocks_lesson_id": 106,
  "is_randomized": true,
  "questions": [
    {
      "question": "ما هو المتغير؟",
      "type": "multiple_choice",
      "options": ["مكان لتخزين البيانات", "نوع من الحلقات", "دالة رياضية"],
      "correct_answer": 0
    }
  ]
}
```

2. **الاستجابة - تأكيد الإنشاء**:
```json
{
  "success": true,
  "data": {
    "id": 301,
    "title": "اختبار أساسيات البرمجة",
    "unlocks_lesson": {
      "id": 106,
      "title": "الدوال في البرمجة"
    }
  }
}
```

### السيناريو 2: طالب يحاول الوصول لدرس مقفل بواسطة اختبار

**الهدف**: منع الوصول للدرس حتى اجتياز الاختبار المطلوب

**الخطوات**:

1. **محاولة الوصول للدرس**:
```http
GET /api/lessons/106/can-access
Authorization: Bearer {student_token}
```

2. **الاستجابة - منع الوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "QUIZ_NOT_PASSED",
    "requiredQuizzes": [
      {
        "id": 301,
        "title": "اختبار أساسيات البرمجة",
        "passed": false,
        "attempts": 0,
        "maxAttempts": 3
      }
    ],
    "message": "يجب اجتياز الاختبار المطلوب أولاً"
  }
}
```

### السيناريو 3: أداء الاختبار وفتح الدرس

**الهدف**: اجتياز الاختبار وفتح الدرس المرتبط

**الخطوات**:

1. **أداء الاختبار**:
```http
POST /api/quizzes/301/take
{
  "answers": [
    {"questionId": 1, "answer": 0},
    {"questionId": 2, "answer": 1},
    {"questionId": 3, "answer": 2}
  ]
}
```

2. **الاستجابة - النجاح وفتح الدرس**:
```json
{
  "success": true,
  "data": {
    "attemptId": 501,
    "score": 85,
    "passed": true,
    "is_passed": true,
    "passingScore": 70,
    "unlocked_lesson": {
      "id": 106,
      "title": "الدوال في البرمجة",
      "unlocked": true
    },
    "message": "تهانينا! لقد اجتزت الاختبار وتم فتح الدرس التالي"
  }
}
```

3. **التحقق من إمكانية الوصول للدرس**:
```http
GET /api/lessons/106/can-access
Authorization: Bearer {student_token}
```

4. **الاستجابة - السماح بالوصول**:
```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "reason": "QUIZ_PASSED",
    "unlockedBy": {
      "quizId": 301,
      "attemptId": 501,
      "score": 85
    }
  }
}
```

### السيناريو 4: فشل في الاختبار

**الهدف**: التعامل مع فشل الطالب في الاختبار

**الخطوات**:

1. **أداء الاختبار بدرجة منخفضة**:
```http
POST /api/quizzes/301/take
{
  "answers": [
    {"questionId": 1, "answer": 1},
    {"questionId": 2, "answer": 0},
    {"questionId": 3, "answer": 1}
  ]
}
```

2. **الاستجابة - الفشل**:
```json
{
  "success": true,
  "data": {
    "attemptId": 502,
    "score": 45,
    "passed": false,
    "is_passed": false,
    "passingScore": 70,
    "attemptsLeft": 2,
    "message": "لم تجتز الاختبار. يمكنك المحاولة مرة أخرى"
  }
}
```

3. **محاولة الوصول للدرس مرة أخرى**:
```http
GET /api/lessons/106/can-access
Authorization: Bearer {student_token}
```

4. **الاستجابة - لا يزال مقفلاً**:
```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "reason": "QUIZ_NOT_PASSED",
    "requiredQuizzes": [
      {
        "id": 301,
        "title": "اختبار أساسيات البرمجة",
        "passed": false,
        "attempts": 1,
        "maxAttempts": 3,
        "lastScore": 45
      }
    ]
  }
}
```

---

## 🔄 سيناريوهات مركبة

### السيناريو المركب 1: مسار تعلم كامل

**الهدف**: تتبع رحلة طالب كاملة من البداية للنهاية

**الخطوات**:

1. **التسجيل في الدورة**:
```http
POST /api/courses/1/enroll
Authorization: Bearer {student_token}
```

2. **البدء بالدرس الأول (مجاني)**:
```http
GET /api/lessons/101
Authorization: Bearer {student_token}
```

3. **إكمال الدرس الأول**:
```http
POST /api/lessons/101/complete
Authorization: Bearer {student_token}
```

4. **الوصول للدرس الثاني**:
```http
GET /api/lessons/102
Authorization: Bearer {student_token}
```

5. **إكمال الدرس الثاني**:
```http
POST /api/lessons/102/complete
Authorization: Bearer {student_token}
```

6. **أداء الاختبار الأول**:
```http
POST /api/quizzes/301/take
Authorization: Bearer {student_token}
```

7. **الوصول للدرس المتقدم**:
```http
GET /api/lessons/103
Authorization: Bearer {student_token}
```

### السيناريو المركب 2: طالب ذو احتياجات خاصة

**الهدف**: تجربة طالب يحتاج لدعم إمكانية الوصول

**الخطوات**:

1. **الوصول للدرس مع طلب الترجمة**:
```http
GET /api/lessons/101?include_accessibility=true
Authorization: Bearer {student_token}
```

2. **عرض الدرس مع فيديو لغة الإشارة**:
```http
GET /api/lessons/101
Authorization: Bearer {student_token}
```

3. **قراءة النص المكتوب**:
```http
GET /api/lessons/101/transcript
Authorization: Bearer {student_token}
```

4. **إكمال الدرس**:
```http
POST /api/lessons/101/complete
Authorization: Bearer {student_token}
```

---

## 📊 مؤشرات الأداء والتتبع

### تتبع استخدام ميزات إمكانية الوصول:
```http
GET /api/analytics/accessibility-usage
Authorization: Bearer {admin_token}
```

### تتبع معدلات إكمال الدروس:
```http
GET /api/analytics/lesson-completion-rates
Authorization: Bearer {instructor_token}
```

### تتبع نجاح الاختبارات:
```http
GET /api/analytics/quiz-success-rates
Authorization: Bearer {instructor_token}
```

---

## 🚨 حالات الخطأ الشائعة

### خطأ في الوصول للدرس:
```json
{
  "success": false,
  "error": "ACCESS_DENIED",
  "message": "لا يمكنك الوصول لهذا الدرس",
  "details": {
    "reason": "PREVIOUS_LESSON_NOT_COMPLETED",
    "requiredLesson": 104
  }
}
```

### خطأ في أداء الاختبار:
```json
{
  "success": false,
  "error": "QUIZ_ATTEMPT_FAILED",
  "message": "فشل في أداء الاختبار",
  "details": {
    "reason": "MAX_ATTEMPTS_EXCEEDED",
    "maxAttempts": 3
  }
}
```

### خطأ في تحميل ملف الترجمة:
```json
{
  "success": false,
  "error": "CAPTIONS_LOAD_FAILED",
  "message": "فشل في تحميل ملف الترجمة",
  "details": {
    "url": "https://cdn.example.com/captions.vtt",
    "reason": "FILE_NOT_FOUND"
  }
}
```

---

*هذا الدليل يغطي جميع السيناريوهات الأساسية للميزات الجديدة في منصة التعلم الإلكتروني*