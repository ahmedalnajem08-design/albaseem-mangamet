# دليل إعداد Supabase و WhatsApp Business API

## 1. إعداد Supabase

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل الدخول أو أنشئ حساب جديد
3. اضغط "New Project"
4. أدخل اسم المشروع وكلمة مرور قوية لقاعدة البيانات
5. اختر المنطقة الأقرب لك
6. انتظر حتى يتم إنشاء المشروع (قد يستغرق دقيقتين)

### الخطوة 2: إنشاء الجداول
1. في لوحة التحكم، اذهب إلى **SQL Editor**
2. انسخ محتوى ملف `supabase-schema.sql` والصقه
3. اضغط **Run** لتنفيذ الأوامر

### الخطوة 3: الحصول على المفاتيح
1. اذهب إلى **Settings** > **API**
2. انسخ:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. إعداد WhatsApp Business API

### الخطوة 1: إنشاء حساب Meta Business
1. اذهب إلى [business.facebook.com](https://business.facebook.com)
2. أنشئ حساب تجاري جديد

### الخطوة 2: إنشاء تطبيق WhatsApp
1. اذهب إلى [developers.facebook.com](https://developers.facebook.com)
2. اضغط **My Apps** > **Create App**
3. اختر **Business** كنوع التطبيق
4. أضف منتج **WhatsApp** للتطبيق

### الخطوة 3: الحصول على المفاتيح
1. في إعدادات التطبيق، اذهب إلى **WhatsApp** > **API Setup**
2. انسخ:
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Access Token** → `WHATSAPP_ACCESS_TOKEN`
   - **WhatsApp Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`

### الخطوة 4: إضافة رقم هاتف (اختياري)
- يمكنك استخدام الرقم التجريبي المجاني
- أو إضافة رقم هاتف حقيقي للإنتاج

---

## 3. إعداد المتغيرات البيئية

### للنشر على Vercel:
1. اذهب إلى **Project Settings** > **Environment Variables**
2. أضف المتغيرات التالية:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
```

### للتطوير المحلي:
أنشئ ملف `.env.local` في جذر المشروع وأضف المتغيرات.

---

## 4. اختبار الإعداد

### اختبار Supabase:
```bash
curl https://your-project.supabase.co/rest/v1/employees \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### اختبار WhatsApp:
```bash
curl -X POST https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messaging_product":"whatsapp","to":"RECIPIENT_PHONE","type":"text","text":{"body":"Hello!"}}'
```

---

## 5. ملاحظات مهمة

### WhatsApp Business API:
- ✅ يعمل على Vercel 100%
- ✅ رسمي من Meta
- ⚠️ تحتاج موافقة على قوالب الرسائل للإرسال الجماعي
- ⚠️ الرسائل الأولى تستخدم قالب hello_world التجريبي
- 💰 مجاني لـ 1000 محادثة/شهر

### Supabase:
- ✅ خطة مجانية سخية (500MB قاعدة بيانات)
- ✅ Real-time subscriptions
- ✅ Row Level Security للحماية
- ✅ Auto-generated APIs

---

## 6. الدعم

- [توثيق Supabase](https://supabase.com/docs)
- [توثيق WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/business-platform)
- [توثيق Next.js](https://nextjs.org/docs)
