# 🏢 AL-BASEEM General Trading System

نظام إدارة شامل للتجارة العامة مع تكامل WhatsApp Business API

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Business_API-25D366)

---

## 📋 المميزات

### 👥 إدارة الزبائن والمدن
- إضافة وتعديل وحذف الزبائن
- ربط الزبائن بمدن متعددة
- تقارير مفصلة لكل زبون
- روابط موقع جوجل ماب

### 📋 إدارة المهام
- مهام يومية وأسبوعية
- مهام متكررة تلقائياً
- تأجيل وإلغاء وإكمال المهام
- تصفية حسب الحالة والتاريخ

### 📱 تكامل WhatsApp Business API
- إرسال رسائل جماعية
- جدولة الرسائل
- سجل الإرسال الكامل
- يعمل على Vercel 100%

### 🔔 التذكيرات
- تذكيرات يومية ومجدولة
- إسناد لموظفين محددين
- تتبع الإنجاز

### 📝 الملاحظات
- ملاحظات عامة للموظفين
- بحث فوري

### ⚙️ الإعدادات
- إدارة المستخدمين والصلاحيات
- النسخ الاحتياطي
- استيراد الزبائن من Excel

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- حساب Supabase
- حساب Meta Business (اختياري - للواتساب)

### 1. استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/al-baseem-system.git
cd al-baseem-system
```

### 2. تثبيت التبعيات
```bash
bun install
# أو
npm install
```

### 3. إعداد المتغيرات البيئية
أنشئ ملف `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Business API (اختياري)
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

### 4. إعداد قاعدة البيانات
1. اذهب إلى [Supabase Dashboard](https://supabase.com)
2. افتح SQL Editor
3. انسخ محتوى `supabase-schema.sql` وشغّله

### 5. تشغيل المشروع
```bash
bun run dev
# أو
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 📁 هيكل المشروع

```
al-baseem-system/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # تسجيل الدخول
│   │   │   ├── employees/     # الموظفين
│   │   │   ├── cities/        # المدن
│   │   │   ├── customers/     # الزبائن
│   │   │   ├── reports/       # التقارير
│   │   │   ├── tasks/         # المهام
│   │   │   ├── reminders/     # التذكيرات
│   │   │   ├── notes/         # الملاحظات
│   │   │   └── whatsapp/      # WhatsApp API
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   └── layout.tsx         # التخطيط
│   ├── utils/
│   │   └── supabase/          # Supabase clients
│   ├── types/
│   │   └── database.ts        # أنواع قاعدة البيانات
│   └── middleware.ts          # حماية المسارات
├── supabase-schema.sql        # سكريبت قاعدة البيانات
├── SETUP-GUIDE.md             # دليل الإعداد
└── .env.example               # مثال للمتغيرات
```

---

## 🔐 بيانات الدخول الافتراضية

بعد تشغيل سكريبت SQL:

| الحقل | القيمة |
|-------|--------|
| رقم الهاتف | `07700000000` |
| كلمة المرور | `123` |
| الدور | مدير |

---

## 🌐 النشر على Vercel

### الطريقة السريعة
1. ارفع المشروع على GitHub
2. اذهب إلى [vercel.com](https://vercel.com)
3. اضغط "Import Project"
4. اختر المستودع
5. أضف المتغيرات البيئية
6. اضغط "Deploy"

### متغيرات Vercel المطلوبة
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID
```

---

## 📱 إعداد WhatsApp Business API

1. اذهب إلى [developers.facebook.com](https://developers.facebook.com)
2. أنشئ تطبيق Business
3. أضف منتج WhatsApp
4. احصل على المفاتيح من API Setup

📖 راجع `SETUP-GUIDE.md` للتفاصيل الكاملة

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|----------|
| Next.js 15 | إطار العمل |
| TypeScript | لغة البرمجة |
| Supabase | قاعدة البيانات + المصادقة |
| Tailwind CSS | التصميم |
| Lucide Icons | الأيقونات |
| WhatsApp Business API | إرسال الرسائل |

---

## 📄 الترخيص

MIT License

---

## 👨‍💻 المطور

**AL-BASEEM General Trading**
- WhatsApp: [+9647762788088](https://wa.me/9647762788088)
- Instagram: [@9.cas](https://instagram.com/9.cas)

---

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:
1. Fork المشروع
2. أنشئ branch جديد
3. قدّم Pull Request

---

## ⭐ إذا أعجبك المشروع

اضغط Star على GitHub! 🌟
