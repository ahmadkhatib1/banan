# 🚀 دليل البدء السريع

## التشغيل في 3 خطوات

### 1️⃣ تثبيت المكتبات
```bash
npm install
```

### 2️⃣ تشغيل الباك إند (في terminal منفصل)
```bash
cd ../backend-express
npm run dev
```

### 3️⃣ تشغيل الفرونت إند
```bash
npm run dev
```

✅ **افتح المتصفح على:** http://localhost:5173

---

## 🎨 تعديل الألوان بسرعة

افتح `src/theme/colors.js`:

```javascript
export const brandColors = {
  primary: {
    main: '#0069CC',  // ← غير هذا اللون
  },
  secondary: {
    main: '#FFD650',  // ← غير هذا اللون
  },
};
```

---

## 📁 أهم الملفات

```
src/
├── theme/theme.js           # ← التحكم الكامل في الثيم
├── theme/colors.js          # ← تعديل الألوان بسرعة
├── store/store.js           # ← Redux Store
├── store/api/               # ← جميع APIs
├── pages/                   # ← جميع الصفحات
└── App.jsx                  # ← المسارات والتوجيه
```

---

## 🔗 روابط مفيدة

- [التوثيق الكامل](./README_FRONTEND.md)
- [دليل المشروع](../FRONTEND_PROJECT_GUIDE.md)
- [API الباك إند](../API_DOCUMENTATION.md)

---

## 🆘 مشاكل شائعة

### المشكلة: الباك إند لا يعمل
```bash
cd backend-express
npm install
npm run dev
```

### المشكلة: خطأ في الاتصال
تأكد من أن `.env.local` يحتوي على:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

**🎓 مشروع جاهز للاستخدام!**
