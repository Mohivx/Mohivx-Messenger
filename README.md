# Mohivx Messenger

<p align="center">
  <img src="assets/icon-256.png" width="128" height="128" alt="Mohivx Messenger Logo" />
</p>

<p align="center">
  <strong>تطبيق المراسلة الموحد لنظام Windows 11 — تجربة متطابقة مع Beeper بهوية برمجية مستقلة</strong>
  <br />
  <em>The Unified Desktop Messaging Experience for Windows 11 — 1:1 Beeper Visual Parity with Independent Architecture</em>
</p>

---

## 🌟 نظرة عامة | Overview

**Mohivx Messenger** هو تطبيق مكتبي احترافي متكامل مصمم لنظام **Windows 11**، يجمع منصات المراسلة العالمية في واجهة واحدة موحدة وسريعة. تم بناؤه من الصفر بكود مستقل بالكامل مع الحفاظ على أعلى درجات التطابق البصري والوظيفي مع تطبيق **Beeper** المرجعي.

### المميزات الأساسية:
- 🎨 **تطابق بصري كامل 1:1 مع Beeper:**
  - الشريط الجانبي بمقاس `68px` مع مؤشرات الحالة والأقسام.
  - قائمة المحادثات المنسدلة بمقاس `252px` مع الفلاتر السريعة وشارات الرسائل غير المقروءة.
  - بطاقة المحادثة المظلمة ذات الحواف المنحنية (`10px radius`) وفقاعات الرسائل المصممة بدقة.
  - شريط الأوامر والبحث الشامل (`Ctrl + K`).
  - نافذة بدء المحادثات والمجموعات (`Ctrl + N`).
  - شاشة إعدادات متكاملة تضم 11 قسماً مع هوية Mohivx الرسمية.
- 🔒 **أمان وخصوصية محلية 100%:**
  - لا توجد خوادم وسيطة طرف ثالث تستلم رسائلك أو بياناتك.
  - تشفير محلي للرموز والجلسات عبر معيار Windows DPAPI.
- ⚡ **أداء فائق:**
  - استهلاك ذاكرة منخفض وسرعة استجابة تفوق 60 إطاراً في الثانية.
  - دعم أصلي لـ Windows 11 (Mica, System Tray, Desktop Notifications).
- 🧩 **معمارية الموصلات النمطية (Modular Connectors Architecture):**
  - دعم نظام موصلات مستقل لكل منصة: Telegram, WhatsApp, Discord, Slack, Signal, Matrix, Google Messages.

---

## 🚀 التثبيت والتشغيل | Installation

يمكنك تحميل مثبت البرنامج الرسمي مباشرة من صفحة [GitHub Releases](https://github.com/Mohivx/Mohivx-Messenger/releases):

1. حمّل ملف: `Mohivx Messenger-Setup-1.0.0.exe`.
2. شغّل ملف التثبيت على نظام Windows 11.
3. سينشئ البرنامج تلقائياً اختصارات سطح المكتب وقائمة Start وصندوق النظام (Tray).

---

## 🛠️ البناء والتطوير من المصدر | Building from Source

### المتطلبات:
- Node.js (v20 أو أحدث)
- npm أو pnpm
- Windows 10/11 x64

### خطوات البناء:
```bash
# 1. استنساخ المستودع
git clone https://github.com/Mohivx/Mohivx-Messenger.git
cd Mohivx-Messenger

# 2. تثبيت الحزم
npm install

# 3. تشغيل وضع التطوير
npm run dev

# 4. بناء ملفات الواجهة ومحرك Electron
npm run build

# 5. إنشاء مثبت الويندوز النهائي (NSIS Setup EXE)
npm run dist:win
```

ستجد ملف التثبيت الناتج في مجلد `release/`.

---

## 📐 المعمارية التقنية | Architecture

```text
Mohivx Messenger
├── assets/                # أيقونات وشعارات Mohivx الرسمية بمختلف المقاسات
├── electron/              # المحرك الرئيسي لنظام Windows
│   ├── main.ts            # إدارة النوافذ، الـ Tray، الإشعارات، و الـ IPC
│   ├── preload.ts         # جسر الأمان وعزل السياق (Context Isolation)
│   └── connectors/        # نظام الموصلات المستقلة للمنصات (Telegram, WhatsApp, etc.)
├── src/                   # واجهة المستخدم (React + TypeScript + Tailwind)
│   ├── components/        # مكونات الواجهة (LeftRail, ThreadList, ConversationView, etc.)
│   ├── types/             # النماذج وهياكل البيانات القياسية
│   └── data/              # البيانات الأولية والتخزين المحلي
└── package.json           # إعدادات الحزم ومثبت NSIS
```

---

## 📄 الترخيص والحقوق | License & Attribution

- **المطور:** [Mohivx](https://github.com/Mohivx)
- **الترخيص:** MIT License
- جميع الأكواد البرمجية والمعمارية مكتوبة ومطورة بشكل مستقل بالكامل لصالح **Mohivx**.
