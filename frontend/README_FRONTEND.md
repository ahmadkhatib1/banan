# 🎓 منصة التعليم الإلكتروني - الواجهة الأمامية

واجهة أمامية متقدمة للمنصة التعليمية الإلكترونية مبنية بـ React و MUI و Redux Toolkit

## 🏗️ التقنيات المستخدمة

### الأساسيات
- **React 18** - مكتبة JavaScript لبناء واجهات المستخدم
- **Vite** - أداة البناء السريعة
- **Material-UI (MUI)** - مكتبة مكونات React الشاملة

### إدارة الحالة والبيانات
- **Redux Toolkit** - إدارة الحالة الحديثة
- **RTK Query** - جلب البيانات والتخزين المؤقت
- **React Router DOM** - التوجيه والتنقل

### الهوية البصرية
- **الألوان الرئيسية:**
  - Primary: `#0069CC` (أزرق)
  - Secondary: `#FFD650` (أصفر)
  - Coral: `#FF7F50`
  - Pink: `#FF5079`
  - Turquoise: `#40B5AD`
  - Gray: `#5D6D7E`

- **الخط:** Nunito

## 📦 هيكل المشروع

```
frontend/
├── src/
│   ├── theme/              # إعدادات الثيم والألوان
│   │   ├── theme.js        # Theme الرئيسي
│   │   └── colors.js       # ملف الألوان القابل للتعديل
│   ├── store/              # Redux Store
│   │   ├── store.js        # Store الرئيسي
│   │   ├── slices/         # Redux Slices
│   │   │   └── authSlice.js
│   │   └── api/            # RTK Query APIs
│   │       ├── apiSlice.js
│   │       ├── authApi.js
│   │       ├── coursesApi.js
│   │       └── lessonsApi.js
│   ├── pages/              # صفحات التطبيق
│   │   ├── auth/           # صفحات المصادقة
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── dashboard/      # لوحات التحكم
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── InstructorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── courses/        # صفحات الدورات
│   │   │   ├── CourseList.jsx
│   │   │   └── CourseDetails.jsx
│   │   └── lessons/        # صفحات الدروس
│   │       └── LessonView.jsx
│   ├── components/         # مكونات قابلة لإعادة الاستخدام
│   │   └── common/
│   │       └── ProtectedRoute.jsx
│   ├── utils/              # أدوات مساعدة
│   │   └── apiConfig.js    # إعدادات API
│   ├── App.jsx             # المكون الرئيسي
│   ├── main.jsx            # نقطة الدخول
│   └── index.css           # الأنماط الأساسية
└── .env.local              # متغيرات البيئة
```

## 🚀 البدء السريع

### المتطلبات
- Node.js (v16 أو أحدث)
- npm أو yarn

### التثبيت

```bash
cd frontend
npm install
```

### التشغيل في وضع التطوير

```bash
npm run dev
```

التطبيق سيعمل على: `http://localhost:5173`

### البناء للإنتاج

```bash
npm run build
```

## 🎨 تخصيص الثيم

يمكنك تعديل الألوان والثيم بسهولة من خلال ملفين رئيسيين:

### 1. ملف الألوان (`src/theme/colors.js`)

```javascript
export const brandColors = {
  primary: {
    main: '#0069CC',    // غير اللون الأساسي هنا
    // ...
  },
  secondary: {
    main: '#FFD650',    // غير اللون الثانوي هنا
    // ...
  },
};
```

### 2. ملف الثيم (`src/theme/theme.js`)

يحتوي على إعدادات MUI الكاملة:
- الألوان
- الخطوط
- الظلال
- تخصيص المكونات

## 🔐 المصادقة والصلاحيات

### الأدوار المتاحة
- **Student** (الطالب): الوصول للدورات والدروس والاختبارات
- **Instructor** (المدرب): إدارة الدورات والدروس
- **Admin** (المسؤول): صلاحيات إدارية كاملة

### آلية المصادقة
- JWT Token Authentication
- Auto-refresh للرموز المنتهية
- حماية المسارات باستخدام ProtectedRoute
- تخزين آمن في localStorage

## 📡 التواصل مع API

### إعداد URL الباك إند

في ملف `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### استخدام RTK Query

```javascript
import { useGetCoursesQuery } from './store/api/coursesApi';

function CoursesComponent() {
  const { data, isLoading, error } = useGetCoursesQuery();
  // ...
}
```

## 🎯 الميزات الرئيسية

### 1. نظام المصادقة الكامل
- تسجيل الدخول
- التسجيل الجديد
- نسيان كلمة المرور (جاهز للربط)

### 2. لوحات التحكم المخصصة
- لوحة الطالب مع عرض التقدم
- لوحة المدرب مع إحصائيات الدورات
- لوحة المسؤول للإدارة الكاملة

### 3. إدارة الدورات
- عرض قائمة الدورات
- البحث والفلترة
- التسجيل في الدورات
- عرض تفاصيل الدورة مع الدروس

### 4. عرض الدروس المتقدم
- دعم الفيديو
- الترجمة النصية (Captions)
- **فيديو لغة الإشارة** للصم
- النص المكتوب للدرس
- التنقل بين الدروس
- تتبع التقدم

### 5. إمكانية الوصول (Accessibility)
- دعم كامل للغة العربية (RTL)
- فيديو لغة الإشارة
- ترجمة نصية
- تباين ألوان عالي
- خط واضح وقابل للقراءة

## 🛠️ التطوير والتوسع

### إضافة صفحة جديدة

1. أنشئ الصفحة في المجلد المناسب:
```javascript
// src/pages/example/NewPage.jsx
import { Box, Typography } from '@mui/material';

const NewPage = () => {
  return (
    <Box>
      <Typography>صفحة جديدة</Typography>
    </Box>
  );
};

export default NewPage;
```

2. أضف المسار في `App.jsx`:
```javascript
<Route path="/new-page" element={<NewPage />} />
```

### إضافة API جديد

1. أنشئ ملف API في `src/store/api/`:
```javascript
// src/store/api/newApi.js
import { apiSlice } from './apiSlice';

export const newApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => '/items',
    }),
  }),
});

export const { useGetItemsQuery } = newApi;
```

## 📚 الموارد

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 المساهمة

للمساهمة في تطوير المشروع:

1. Fork المشروع
2. أنشئ branch جديد للميزة
3. Commit التغييرات
4. Push للـ branch
5. افتح Pull Request

## 📝 ملاحظات مهمة

- تأكد من تشغيل الباك إند على `http://localhost:5000`
- جميع الطلبات تتطلب JWT Token ما عدا Login وRegister
- الدروس تدعم التسلسل الصارم (Sequential Access)
- فيديو لغة الإشارة اختياري ويمكن إظهاره/إخفاؤه

---

**🎓 منصة تعليمية متكاملة مطورة بـ ❤️ لخدمة التعليم الإلكتروني**
