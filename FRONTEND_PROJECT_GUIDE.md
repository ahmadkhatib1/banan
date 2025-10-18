# 📘 دليل مشروع الواجهة الأمامية - منصة التعليم الإلكتروني

## 🎯 نظرة عامة

تم إنشاء واجهة أمامية متكاملة للمنصة التعليمية الإلكترونية باستخدام أحدث التقنيات وأفضل الممارسات:

- ✅ React 18 + Vite
- ✅ Material-UI (MUI) للمكونات
- ✅ Redux Toolkit + RTK Query لإدارة الحالة
- ✅ React Router للتوجيه
- ✅ دعم كامل للهوية البصرية
- ✅ تصميم متجاوب (Responsive)
- ✅ دعم RTL للغة العربية
- ✅ دعم إمكانية الوصول (فيديو لغة الإشارة)

---

## 🎨 الهوية البصرية المطبقة

### الألوان

من الملف المرفق (BNAN - 05.pdf):

| اللون | Hex Code | الاستخدام |
|-------|----------|-----------|
| Primary (أزرق) | `#0069CC` | الأزرار الرئيسية، الروابط، العناصر المهمة |
| Secondary (أصفر) | `#FFD650` | التأكيدات، العناصر الثانوية |
| Coral (برتقالي) | `#FF7F50` | التحذيرات |
| Pink (وردي) | `#FF5079` | الأخطاء |
| Turquoise (فيروزي) | `#40B5AD` | النجاح، المعلومات |
| Gray (رمادي) | `#5D6D7E` | النصوص الثانوية |

### الخطوط

- **الخط الرئيسي**: Nunito (من Google Fonts)
- **الخط الاحتياطي**: Cairo (للعربية)
- **الأوزان المستخدمة**: 300, 400, 500, 600, 700, 800

---

## 📁 هيكل المشروع المُنشأ

```
frontend/
├── src/
│   ├── theme/                        # نظام الثيم
│   │   ├── theme.js                  # Theme الرئيسي مع تكامل MUI
│   │   └── colors.js                 # ملف الألوان (قابل للتعديل بسهولة)
│   │
│   ├── store/                        # Redux Store
│   │   ├── store.js                  # الـ Store الرئيسي
│   │   ├── slices/                   # Redux Slices
│   │   │   └── authSlice.js          # إدارة حالة المصادقة
│   │   └── api/                      # RTK Query APIs
│   │       ├── apiSlice.js           # API Slice الرئيسي
│   │       ├── authApi.js            # Auth API
│   │       ├── coursesApi.js         # Courses API
│   │       └── lessonsApi.js         # Lessons API
│   │
│   ├── pages/                        # صفحات التطبيق
│   │   ├── auth/                     # صفحات المصادقة
│   │   │   ├── Login.jsx             # تسجيل الدخول
│   │   │   └── Register.jsx          # التسجيل
│   │   │
│   │   ├── dashboard/                # لوحات التحكم
│   │   │   ├── StudentDashboard.jsx  # لوحة الطالب
│   │   │   ├── InstructorDashboard.jsx # لوحة المدرب
│   │   │   └── AdminDashboard.jsx    # لوحة المسؤول
│   │   │
│   │   ├── courses/                  # صفحات الدورات
│   │   │   ├── CourseList.jsx        # قائمة الدورات
│   │   │   └── CourseDetails.jsx     # تفاصيل الدورة
│   │   │
│   │   └── lessons/                  # صفحات الدروس
│   │       └── LessonView.jsx        # عرض الدرس (مع فيديو لغة الإشارة)
│   │
│   ├── components/                   # مكونات قابلة لإعادة الاستخدام
│   │   └── common/
│   │       └── ProtectedRoute.jsx    # حماية المسارات
│   │
│   ├── utils/                        # الأدوات المساعدة
│   │   └── apiConfig.js              # تكوين API
│   │
│   ├── App.jsx                       # المكون الرئيسي
│   ├── main.jsx                      # نقطة الدخول
│   └── index.css                     # الأنماط الأساسية
│
├── .env.local                        # متغيرات البيئة
├── package.json                      # التبعيات
├── vite.config.js                    # تكوين Vite
└── README_FRONTEND.md                # التوثيق التفصيلي
```

---

## 🚀 البدء السريع

### 1. تثبيت التبعيات

```bash
cd frontend
npm install
```

### 2. إعداد متغيرات البيئة

الملف `.env.local` موجود بالفعل:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. تشغيل المشروع

```bash
npm run dev
```

التطبيق سيعمل على: **http://localhost:5173**

### 4. تشغيل الباك إند

في نافذة terminal منفصلة:

```bash
cd backend-express
npm run dev
```

الباك إند سيعمل على: **http://localhost:5000**

---

## 🎨 تخصيص الألوان والثيم

### طريقة سهلة - ملف الألوان

افتح `src/theme/colors.js` وغير الألوان:

```javascript
export const brandColors = {
  primary: {
    main: '#0069CC',      // ← غير هذا اللون
    light: '#3D8DD6',
    dark: '#004A8F',
  },
  secondary: {
    main: '#FFD650',      // ← غير هذا اللون
    light: '#FFE073',
    dark: '#E6C147',
  },
};
```

### طريقة متقدمة - ملف الثيم

افتح `src/theme/theme.js` للتحكم الكامل في:
- الخطوط (Typography)
- الظلال (Shadows)
- الحواف المستديرة (Border Radius)
- تخصيص المكونات (Component Overrides)

---

## 🔐 نظام المصادقة والصلاحيات

### الأدوار المتاحة

| الدور | الوصف | لوحة التحكم |
|------|-------|-------------|
| **STUDENT** | طالب | StudentDashboard |
| **INSTRUCTOR** | مدرب | InstructorDashboard |
| **ADMIN** | مسؤول | AdminDashboard |

### آلية العمل

1. **تسجيل الدخول**: يحصل المستخدم على JWT Token
2. **تخزين آمن**: يُخزن Token في localStorage
3. **Auto-refresh**: يتم تحديث Token تلقائياً عند انتهاء صلاحيته
4. **حماية المسارات**: استخدام ProtectedRoute لحماية الصفحات
5. **Logout**: يتم مسح جميع البيانات من localStorage

---

## 📡 التواصل مع API

### استخدام RTK Query

جميع الاتصالات مع API تستخدم RTK Query:

```javascript
// مثال: جلب قائمة الدورات
import { useGetCoursesQuery } from './store/api/coursesApi';

function CourseList() {
  const { data, isLoading, error } = useGetCoursesQuery();

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <div>{/* عرض البيانات */}</div>;
}
```

### APIs المتاحة

#### 1. Authentication API (`authApi.js`)
- `useLoginMutation()` - تسجيل الدخول
- `useRegisterMutation()` - التسجيل
- `useLogoutMutation()` - تسجيل الخروج
- `useGetMeQuery()` - معلومات المستخدم الحالي
- `useUpdateProfileMutation()` - تحديث الملف الشخصي

#### 2. Courses API (`coursesApi.js`)
- `useGetCoursesQuery()` - جلب جميع الدورات
- `useGetCourseByIdQuery(id)` - جلب دورة محددة
- `useGetMyCoursesQuery()` - دوراتي
- `useEnrollInCourseMutation()` - التسجيل في دورة
- `useGetCourseLessonsQuery(id)` - دروس الدورة

#### 3. Lessons API (`lessonsApi.js`)
- `useGetLessonByIdQuery(id)` - جلب درس محدد
- `useCompleteLessonMutation()` - إكمال درس
- `useGetNextLessonQuery(id)` - الدرس التالي
- `useGetPreviousLessonQuery(id)` - الدرس السابق

---

## ✨ الميزات الخاصة المُطبقة

### 1. دعم فيديو لغة الإشارة للصم

في صفحة `LessonView.jsx`:

- **عرض فيديو لغة الإشارة**: يظهر في الزاوية السفلية اليمنى
- **قابل للتوسيع**: النقر على الأيقونة لتكبير/تصغير الفيديو
- **اختياري**: يظهر فقط إذا كان متوفراً في بيانات الدرس

```javascript
{lesson.sign_language_video_url && (
  <Paper
    sx={{
      position: 'absolute',
      bottom: 16,
      right: 16,
      // ...
    }}
  >
    <video src={lesson.sign_language_video_url} />
  </Paper>
)}
```

### 2. دعم الترجمة النصية (Captions)

```javascript
<video controls>
  {lesson.captions_url && (
    <track
      kind="captions"
      src={lesson.captions_url}
      srcLang="ar"
      label="العربية"
    />
  )}
</video>
```

### 3. النص المكتوب للدرس (Transcript)

- عرض النص الكامل للدرس
- مفيد للطلاب الصم أو ضعاف السمع
- يمكن نسخه والبحث فيه

---

## 🎯 الصفحات المُنشأة

### 1. صفحات المصادقة

#### Login.jsx
- نموذج تسجيل الدخول
- تصميم جذاب مع gradient background
- معالجة الأخطاء
- إعادة التوجيه بعد النجاح

#### Register.jsx
- نموذج التسجيل مع جميع الحقول
- اختيار نوع الحساب (طالب/مدرب)
- التحقق من تطابق كلمة المرور
- رسائل النجاح والأخطاء

### 2. لوحات التحكم

#### StudentDashboard.jsx
- عرض الإحصائيات (الدورات المسجلة، الدروس المكتملة)
- عرض دوراتي مع التقدم
- زر للبحث عن دورات جديدة

#### InstructorDashboard.jsx
- إحصائيات المدرب
- عرض دوراتي
- زر لإنشاء دورة جديدة

#### AdminDashboard.jsx
- إحصائيات النظام الكاملة
- عرض إجمالي المستخدمين والدورات

### 3. صفحات الدورات

#### CourseList.jsx
- عرض جميع الدورات
- بحث وفلترة
- عرض Card لكل دورة مع الصورة
- Hover effects جميلة

#### CourseDetails.jsx
- تفاصيل الدورة الكاملة
- عرض الدروس مع حالة القفل/الإكمال
- زر التسجيل في الدورة
- معلومات المدرب

### 4. صفحات الدروس

#### LessonView.jsx
- مشغل الفيديو
- دعم الترجمة النصية
- فيديو لغة الإشارة (قابل للتوسيع)
- النص المكتوب (Transcript)
- أزرار التنقل (السابق/التالي)
- زر إكمال الدرس

---

## 🔧 التطوير والتوسع

### إضافة صفحة جديدة

1. أنشئ الملف في المجلد المناسب:

```javascript
// src/pages/example/NewPage.jsx
import { Box, Typography } from '@mui/material';

const NewPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">صفحة جديدة</Typography>
    </Box>
  );
};

export default NewPage;
```

2. أضف المسار في `App.jsx`:

```javascript
import NewPage from './pages/example/NewPage';

// في Routes:
<Route path="/new-page" element={<NewPage />} />
```

### إضافة API جديد

1. أنشئ ملف في `src/store/api/`:

```javascript
// src/store/api/quizzesApi.js
import { apiSlice } from './apiSlice';

export const quizzesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getQuizzes: builder.query({
      query: () => '/quizzes',
      providesTags: ['Quiz'],
    }),
  }),
});

export const { useGetQuizzesQuery } = quizzesApi;
```

2. استخدمه في المكون:

```javascript
import { useGetQuizzesQuery } from '../../store/api/quizzesApi';

function QuizList() {
  const { data, isLoading } = useGetQuizzesQuery();
  // ...
}
```

---

## 📦 المكتبات المستخدمة

| المكتبة | النسخة | الاستخدام |
|---------|--------|-----------|
| react | ^18.3.1 | المكتبة الأساسية |
| vite | ^7.1.10 | أداة البناء |
| @mui/material | latest | مكونات UI |
| @reduxjs/toolkit | latest | إدارة الحالة |
| react-redux | latest | ربط Redux بـ React |
| react-router-dom | latest | التوجيه |
| axios | latest | HTTP Requests |
| @emotion/react | latest | CSS-in-JS |
| @emotion/styled | latest | Styled Components |

---

## 🎨 معايير التصميم المُطبقة

### 1. التناسق (Consistency)
- استخدام نفس الألوان في كل التطبيق
- نفس نمط الأزرار والـ Cards
- نفس المسافات والهوامش

### 2. إمكانية الوصول (Accessibility)
- ✅ دعم RTL للغة العربية
- ✅ فيديو لغة الإشارة للصم
- ✅ ترجمة نصية
- ✅ تباين ألوان عالي
- ✅ أحجام خطوط واضحة

### 3. الاستجابة (Responsiveness)
- تصميم متجاوب لجميع الشاشات
- استخدام Grid من MUI
- Breakpoints مُحددة

### 4. تجربة المستخدم (UX)
- Feedback فوري للمستخدم
- رسائل خطأ واضحة
- Loading states
- Animations سلسة

---

## 🔍 نقاط مهمة

### ✅ ما تم إنجازه

1. ✅ إعداد المشروع الكامل مع Vite
2. ✅ تثبيت جميع المكتبات المطلوبة
3. ✅ إنشاء نظام Theme قابل للتعديل
4. ✅ إعداد Redux Store + RTK Query
5. ✅ إنشاء APIs للتواصل مع الباك إند
6. ✅ صفحات المصادقة (Login, Register)
7. ✅ 3 لوحات تحكم (Student, Instructor, Admin)
8. ✅ صفحات الدورات (List, Details)
9. ✅ صفحة عرض الدرس مع فيديو لغة الإشارة
10. ✅ نظام حماية المسارات
11. ✅ دعم RTL الكامل
12. ✅ التوثيق الشامل

### 🔄 ما يمكن إضافته لاحقاً

- صفحات الاختبارات (Quizzes)
- صفحة نسيان كلمة المرور (كاملة)
- صفحات إدارة المستخدمين (للمسؤول)
- صفحة إنشاء دورة جديدة (للمدرب)
- صفحة تعديل الدرس
- نظام الإشعارات
- Chat/Messaging
- تقارير وتحليلات متقدمة

---

## 🚀 الاختبار والبناء

### اختبار التطوير

```bash
cd frontend
npm run dev
```

### البناء للإنتاج

```bash
npm run build
```

الملفات ستكون في مجلد `dist/`

### معاينة البناء

```bash
npm run preview
```

---

## 📞 الدعم والمساعدة

### الموارد المفيدة

- [React Docs](https://react.dev/)
- [MUI Docs](https://mui.com/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite Docs](https://vitejs.dev/)

### حل المشاكل الشائعة

#### المشكلة: لا يتصل بالباك إند

**الحل**: تأكد من:
1. تشغيل الباك إند على http://localhost:5000
2. ملف `.env.local` يحتوي على URL الصحيح
3. CORS مفعل في الباك إند

#### المشكلة: الألوان لا تتطابق

**الحل**: تحقق من `src/theme/colors.js` و `src/theme/theme.js`

#### المشكلة: الخط لا يظهر

**الحل**: تحقق من اتصال الإنترنت (Google Fonts)

---

## 🎉 الخلاصة

تم بناء واجهة أمامية متكاملة وجاهزة للاستخدام مع:

- ✅ تصميم احترافي متوافق مع الهوية البصرية
- ✅ تكامل كامل مع API الباك إند
- ✅ دعم خاص للصم (فيديو لغة الإشارة)
- ✅ نظام مصادقة وصلاحيات كامل
- ✅ تصميم متجاوب ومتوافق مع جميع الأجهزة
- ✅ كود نظيف ومنظم وقابل للتوسع
- ✅ توثيق شامل

**المشروع جاهز للتطوير والاستخدام!** 🚀

---

**🎓 تم التطوير بـ ❤️ لخدمة التعليم الإلكتروني الشامل**
