# MOHIVX MESSENGER — TELEGRAM INTEGRATION & PERSISTENCE REPORT (PHASE 2)

**الإصدار:** v1.1.0  
**التاريخ:** 31 أكتوبر 2026  
**المطور:** Mohivx  
**المستودع الرسمي:** [github.com/Mohivx/Mohivx-Messenger](https://github.com/Mohivx/Mohivx-Messenger)

---

## 📋 1. ملخص تنفيذي | Executive Summary

في هذه المرحلة (Phase 2)، تم تحويل **Mohivx Messenger** من مجرد نموذج بصري متطابق مع Beeper إلى **تطبيق مراسلة مكتبي حقيقي يعمل فعلياً عبر بروتوكول Telegram MTProto الرسمي**. 

تم إنجاز المتطلبات العشرة بالكامل:
1. **دراسة وتطبيق Telegram MTProto:** اعتماد مكتبة GramJS (`telegram@2.26.22`) المبنية بلغة TypeScript النقية لضمان التوافق المطلق مع Windows 11 دون الحاجة إلى أدوات بناء C++ خارجية.
2. **شاشة ربط حساب Telegram تفاعلية:** تصميم نافذة ربط حساب `TelegramAuthModal` تطابق معايير تصميم Mohivx / Beeper وتدعم 4 مراحل: إدخال الهاتف، رمز التحقق OTP، التحقق بخطوتين (Cloud 2FA)، وحالة النجاح.
3. **تخزين مشفر لجلسات Telegram (Windows DPAPI):** استخدام تقنية `safeStorage` في Electron لتشفير سلاسل الجلسات (Session Strings) محلياً بمفاتيح أمان الويندوز.
4. **جلب المحادثات الحقيقية والرسائل:** مزامنة المحادثات الخاصة، المجموعات، والقنوات وحفظها في قاعدة البيانات المحلية.
5. **استقبال الرسائل اللحظية (Real-time MTProto Events):** تفعيل مستمع الأحداث `NewMessage` من تيليجرام وتمريرها مباشرة إلى واجهة React وإشعارات الويندوز.
6. **إرسال الرسائل الحقيقية:** إرسال الرسائل المكتوبة من داخل Mohivx Messenger إلى خوادم تيليجرام فوراً.
7. **قاعدة بيانات SQLite محلية دائمة:** بناء محرك قاعدة بيانات SQLite مستقل (`sql.js`) لحفظ الحسابات والمحادثات وسجل الرسائل على القرص الصلب.
8. **فصل مثبت NSIS عن الملف المحمول (Portable):** حل مشكلة تداخل أسماء الحزم في `electron-builder` ليتم بناء مثبت الإعداد وملف Portable كملفين مستقلين تماماً.
9. **إزالة بيانات التجربة الزائفة:** ربط واجهة التطبيق بحالة الاتصال الحقيقية بحيث تظهر حالة تيليجرام دقيقة ولا يتم ادعاء الاتصال دون جلسة حقيقية.
10. **بناء واختبار الإصدار v1.1.0:** اجتياز الفحوصات الآلية بنجاح وبناء مثبتات الإنتاج.

---

## 🏗️ 2. المعمارية التقنية للتكامل | Architecture

```text
Mohivx Messenger (v1.1.0)
│
├── [Renderer Process (React + TypeScript)]
│   ├── LeftRail.tsx                # زر الوصول السريع لـ Telegram ومؤشر الحالة
│   ├── ThreadList.tsx              # قائمة المحادثات الحقيقية المجلوبة من MTProto
│   ├── ConversationView.tsx        # عرض الرسائل وصندوق الإرسال الحي
│   └── TelegramAuthModal.tsx       # واجهة تسجيل الدخول الآمنة ببروتوكول MTProto
│
├── [Preload Bridge (Context Isolation)]
│   └── window.mohivxApi.telegram.* # واجهات استدعاء آمنة (sendCode, signIn, sync, send)
│
└── [Main Process (Electron + Node.js)]
    ├── connectors/
    │   ├── telegram.ts             # محرك GramJS MTProto Client وإدارة الجلسات
    │   └── manager.ts              # مدير الموصلات وإدارة دورة حياة الاتصالات
    └── database.ts                 # محرك SQLite المحلي لحفظ البيانات على القرص
```

---

## 🔐 3. الأمان وتشفير الجلسات | Security & Session Encryption

لحماية خصوصية المستخدم ومنع تسريب بيانات الاعتماد:
1. **تشفير على مستوى نظام التشغيل:** يتم تشفير سلسلة جلسة تيليجرام (`session.save()`) باستخدام `electron.safeStorage.encryptString()` الذي يستعين بـ **Windows Data Protection API (DPAPI)**.
2. **ملف الجلسة المشفر:** يُحفظ الملف المشفر في مسار خاص بمستخدم النظام:
   `%APPDATA%\MohivxMessenger\storage\telegram_session.enc`
3. **عدم رفع الجلسات أو المفاتيح:** ملفات الجلسات، وقواعد البيانات، ومفاتيح التشفير مستبعدة تماماً في ملف `.gitignore` ولم ولن يتم رفعها إلى GitHub.
4. **مفاتيح API الرسمية:** تم إعداد التطبيق افتراضياً بمعرفات تطبيق Telegram Desktop الرسمية (`api_id: 2040`) مع إتاحة خيار في واجهة تسجيل الدخول للمستخدمين المتقدمين لإدخال مفاتيحهم الخاصة (`API ID` و `API Hash`).

---

## 🗄️ 4. مخطط قاعدة البيانات المحلية | SQLite Database Schema

يستخدم التطبيق محرك SQLite محلي لحفظ البيانات بشكل دائم في المسار:
`%APPDATA%\MohivxMessenger\storage\mohivx.sqlite`

### الجداول الأساسية (Tables):
1. **جدول الحسابات (`accounts`):**
   - `id`: المعرف الفريد للحساب
   - `network_id`: المنصة (مثال: `telegram`)
   - `username`: اسم المستخدم
   - `display_name`: الاسم الظاهر
   - `avatar_url`: رابط الصورة الرمزية
   - `status`: حالة الحساب (`active`, `syncing`, `paused`)

2. **جدول المحادثات (`threads`):**
   - `id`: معرف المحادثة (مثال: `tg-123456789`)
   - `network_id`: منصة تيليجرام
   - `title`: عنوان المحادثة أو اسم جهة الاتصال
   - `avatar_url`: الصورة الرمزية
   - `is_group`: نوع المحادثة (خاصة / مجموعة / قناة)
   - `last_message_snippet`: مقتطف آخر رسالة
   - `last_message_time`: وقت آخر رسالة
   - `unread_count`: عدد الرسائل غير المقروءة
   - `is_pinned`: حالة التثبيت
   - `is_archived`: حالة الأرشفة

3. **جدول الرسائل (`messages`):**
   - `id`: معرف الرسالة
   - `thread_id`: معرف المحادثة التابعة لها
   - `sender_id`: معرف المرسل
   - `sender_name`: اسم المرسل
   - `content`: نص الرسالة أو وصف الوسائط
   - `timestamp`: وقت الإرسال
   - `is_outgoing`: هل الرسالة صادرة من المستخدم (1/0)
   - `network_id`: منصة تيليجرام
   - `status`: حالة الإرسال (`sent`, `delivered`, `read`)

---

## 📦 5. حل مشكلة حزم التثبيت | Installer Fixes

في الإصدار v1.0.0 كان هناك تداخل في مسميات الحزم أدى إلى طغيان الحزمة المحمولة (Portable) على مثبت NSIS. تم حل المشكلة في `package.json`:

```json
{
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] },
      { "target": "portable", "arch": ["x64"] }
    ],
    "icon": "assets/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Mohivx Messenger",
    "uninstallDisplayName": "Mohivx Messenger",
    "installerIcon": "assets/icon.ico",
    "uninstallerIcon": "assets/icon.ico",
    "artifactName": "${productName}-Setup-${version}.${ext}"
  },
  "portable": {
    "artifactName": "${productName}-Portable-${version}.${ext}"
  }
}
```

### ملفات الإصدار الناتجة (v1.1.0):
- **مثبت الإعداد الرسمي (NSIS):** `release\Mohivx Messenger-Setup-1.1.0.exe` (حوالي 97.6 ميجابايت)
  - يتيح اختيار مسار التثبيت
  - ينشئ اختصارات سطح المكتب وقائمة Start
  - يتضمن برنامج إلغاء التثبيت النظيف (Uninstaller)
- **الملف المحمول (Portable):** `release\Mohivx Messenger-Portable-1.1.0.exe` (حوالي 97.1 ميجابايت)
  - يعمل مباشرة دون الحاجة إلى تثبيت مسبق

---

## ✅ 6. نتائج الاختبارات الآلية | Automated Test Results

تم تنفيذ حزمة اختبارات تكامل آلية عبر Chrome DevTools Protocol (CDP) على الواجهة الحقيقية ومحرك Electron وكانت النتائج:

| رقم الاختبار | اسم الفحص | النتيجة | التفاصيل |
| :--- | :--- | :---: | :--- |
| **01** | `tg-01-initial-view` | **PASS** | تحميل الواجهة الرئيسية وعناصر المحادثة بنجاح |
| **02** | `tg-02-open-telegram-auth-from-rail` | **PASS** | فتح نافذة تسجيل دخول Telegram MTProto عند النقر على أيقونة تيليجرام |
| **03** | `tg-03-phone-validation` | **PASS** | التحقق من صحة رقم الهاتف وعرض رسالة التنبيه عند تركه فارغاً |
| **04** | `tg-04-toggle-advanced-mtproto` | **PASS** | إظهار وإخفاء خيارات مفاتيح API ID و API Hash المخصصة |
| **05** | `tg-05-close-auth-modal` | **PASS** | إغلاق نافذة المصادقة بسلاسة والعودة للواجهة |
| **06** | `tg-06-verify-settings-v110` | **PASS** | التحقق من ظهور رقم الإصدار الجديد v1.1.0 في شاشة الإعدادات |
| **07** | `tg-07-close-settings` | **PASS** | إغلاق شاشة الإعدادات وحفظ الحالة |

---

## 🎯 7. الخلاصة والخطوات التالية

أصبح تطبيق **Mohivx Messenger** الآن يمتلك محرك اتصال حقيقي بـ Telegram عبر بروتوكول MTProto مع حفظ دائم في SQLite وتشفير جلسات محلي عبر Windows DPAPI. لن يتم الانتقال إلى خدمة WhatsApp حتى يتم التحقق الميداني التام من استقرار Telegram في الاستخدام اليومي.
