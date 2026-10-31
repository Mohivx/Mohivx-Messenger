# Mohivx Messenger

<p align="center">
  <img src="assets/icon-256.png" width="128" height="128" alt="Mohivx Messenger Official Logo" />
</p>

<p align="center">
  <strong>تطبيق المراسلة الموحد لنظام Windows 11 — تجربة متطابقة مع Beeper بهوية برمجية مستقلة ودعم ثنائي اللغة (عربي / English)</strong>
  <br />
  <em>The Unified Desktop Messaging Experience for Windows 11 — 1:1 Beeper Parity with Independent Architecture & Full Bilingual Support (Arabic / English)</em>
</p>

<p align="center">
  <a href="https://github.com/Mohivx/Mohivx-Messenger/releases/tag/v1.1.0">
    <img src="https://img.shields.io/badge/Release-v1.1.0-blue.svg?style=flat-square" alt="Release v1.1.0" />
  </a>
  <a href="https://github.com/Mohivx/Mohivx-Messenger/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License MIT" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows%2011%20x64-0078D4.svg?style=flat-square" alt="Windows 11" />
  <img src="https://img.shields.io/badge/Language-Arabic%20%7C%20English-purple.svg?style=flat-square" alt="Bilingual" />
</p>

---

## 🌟 نظرة عامة | Overview

### بالعربية:
**Mohivx Messenger** هو تطبيق مكتبي احترافي متكامل لنظام **Windows 11**، يجمع منصات المراسلة في واجهة واحدة موحدة وسريعة. تم بناؤه من الصفر بكود مستقل بالكامل مع الحفاظ على أعلى درجات التطابق البصري والوظيفي مع تطبيق **Beeper** المرجعي، ويشمل دعماً ثنائي اللغة بالكامل (العربية والإنجليزية) مع التبديل الفوري واتجاه النصوص الديناميكي (RTL/LTR).

### In English:
**Mohivx Messenger** is a desktop messaging client engineered for **Windows 11**, unifying your favorite chat networks into a single, high-performance interface. Built from scratch with an independent codebase, it achieves 1:1 visual and UX parity with **Beeper** while offering full bilingual support (Arabic and English) with instant toggle and dynamic RTL/LTR layout handling.

---

## ✨ المميزات الرئيسية | Key Features

### 1. تطابق بصري ووظيفي 1:1 مع Beeper (1:1 Parity)
- **Left Rail (68px):** شريط تنقل جانبي يضم أيقونات الحسابات، المؤشرات الحية للحالة، زر إضافة حساب جديد، وزر الإعدادات.
- **Thread List (252px):** قائمة المحادثات مع الفلاتر الذكية (Inbox, Archive, Reminders, Requests, Low Priority)، وفلتر غير المقروءة، والبحث (`Ctrl + K`).
- **Conversation View:** بطاقة المحادثة المظلمة المنحنية، مع فقاعات الرسائل، مؤشرات القراءة، وأزرار الردود والتفاعلات.
- **Settings & Modals:** نافذة إعدادات بـ 11 قسماً، ونافذة بدء محادثة جديدة (`Ctrl + N`).

### 2. دعم كامل للغتين (Arabic & English Bilingual Support)
- تبديل فوري بنقرة واحدة بين العربية 🇸🇦 والإنجليزية 🇺🇸 من شاشة الإعدادات.
- ضبط اتجاه الصفحة تلقائياً (`dir="rtl"` أو `dir="ltr"`).
- حفظ خيار اللغة محلياً واستعادته تلقائياً عند التشغيل.

### 3. تكامل Telegram MTProto الحقيقي (Real Telegram Integration)
- اتصال مباشر عبر بروتوكول MTProto الرسمي (باستخدام GramJS).
- تسجيل دخول حقيقي برقم الهاتف مع رمز التحقق OTP والتحقق بخطوتين (2FA).
- مزامنة المحادثات والرسائل الفعلية وتحديثها فورياً عند وصول رسائل جديدة.

### 4. أمان وتخزين محلي فائق (Local Security & Persistence)
- قاعدة بيانات **SQLite** محلية لحفظ المحادثات وسجل الرسائل في `%APPDATA%\MohivxMessenger\storage\mohivx.sqlite`.
- حماية الجلسات وتشفير المفاتيح باستخدام **Windows DPAPI** (`safeStorage`).
- لا توجد خوادم وسيطة طرف ثالث تستلم رسائلك أو بياناتك الخاصة.

---

## 🚀 التنزيل والتثبيت | Download & Installation

يمكنك تنزيل الإصدار الأخير من صفحة [GitHub Releases v1.1.0](https://github.com/Mohivx/Mohivx-Messenger/releases/tag/v1.1.0):

| الملف / File | النوع / Type | الوصف / Description |
| :--- | :--- | :--- |
| **Mohivx-Messenger-Setup-1.1.0.exe** | مثبت كامل (NSIS Installer) | مثبت احترافي مع اختصارات سطح المكتب وقائمة Start وخيار إلغاء التثبيت. |
| **Mohivx-Messenger-Portable-1.1.0.exe** | نسخة محمولة (Portable) | ملف تنفيذي مستقل يعمل مباشرة بدون أي تثبيت أو صلاحيات إضافية. |

---

## 🛠️ البناء من المصدر | Building from Source

```bash
# 1. استنساخ المستودع / Clone the repository
git clone https://github.com/Mohivx/Mohivx-Messenger.git
cd Mohivx-Messenger

# 2. تثبيت الحزم / Install dependencies
npm install

# 3. تشغيل وضع التطوير / Run in development mode
npm run dev

# 4. بناء المشروع / Build project
npm run build

# 5. تجميع ملفات التثبيت / Package Windows Installers
npm run dist:win
```

---

## 🏛️ الهيكل المعماري للمشروع | Project Architecture

```text
Mohivx Messenger
├── assets/                    # الشعار والأيقونات الرسمية بمختلف الأحجام
├── electron/                  # محرك Electron لنظام Windows 11
│   ├── main.ts                # إدارة النوافذ و الـ IPC والـ Tray
│   ├── preload.ts             # جسر العزل الآمن للواجهة
│   ├── connectors/            # موصلات المنصات (Telegram MTProto, WhatsApp, etc.)
│   └── database/              # محرك التخزين الدائم SQLite
├── src/                       # واجهة المستخدم المبنية بـ React + TypeScript + Tailwind
│   ├── components/            # مكونات الواجهة (LeftRail, ThreadList, ConversationView...)
│   ├── i18n/                  # نظام اللغات والترجمة (LanguageContext, translations)
│   ├── types/                 # تعريفات النماذج والأنواع المشتركة
│   └── data/                  # الإعدادات والبيانات الأولية
└── package.json               # إعدادات الحزم والتجميع لـ Windows
```

---

## 📄 الترخيص والحقوق | License & Attribution

- **المطور / Developer:** [Mohivx](https://github.com/Mohivx)
- **الترخيص / License:** MIT License
- جميع الأكواد البرمجية والمعمارية مكتوبة ومطورة بشكل مستقل بالكامل لصالح **Mohivx**.
