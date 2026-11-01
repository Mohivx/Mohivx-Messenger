# Mohivx Messenger

<p align="center">
  <img src="assets/icon-256.png" width="128" height="128" alt="Mohivx Messenger Official Logo" />
</p>

<p align="center">
  <strong>تطبيق المراسلة الموحد الشامل لنظام Windows 11 — يجمع كل محادثاتك ورسائلك من جميع التطبيقات في مكان واحد بتطابق كامل مع Beeper</strong>
  <br />
  <em>The All-in-One Unified Messaging Desktop Client for Windows 11 — All your chats and messages from every network in one place (1:1 Beeper Parity)</em>
</p>

<p align="center">
  <a href="https://github.com/Mohivx/Mohivx-Messenger/releases/tag/v1.1.0">
    <img src="https://img.shields.io/badge/Release-v1.1.0-blue.svg?style=flat-square" alt="Release v1.1.0" />
  </a>
  <a href="https://github.com/Mohivx/Mohivx-Messenger/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License MIT" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows%2011%20x64-0078D4.svg?style=flat-square" alt="Windows 11" />
  <img src="https://img.shields.io/badge/Support-Arabic%20%7C%20English-purple.svg?style=flat-square" alt="Bilingual" />
</p>

---

## 🌟 الرؤية والهدف | The Vision

### 🇸🇦 بالعربية:
**Mohivx Messenger** هو تطبيق المراسلة المكتبي الموحد والشامل لنظام **Windows 11**. فكرة التطبيق الجوهرية هي **جمع كافة شبكات ومحادثات المراسلة في مكان واحد وصندوق وارد موحد**:
- لا داعي بعد اليوم لفتح عشرات البرامج المختلفة في آن واحد (WhatsApp, Telegram, Discord, Slack, Signal, Instagram, Google Messages, Messenger وغيرها).
- محادثاتك ورسائلك من جميع التطبيقات تجتمع في واجهة واحدة سريعة ومنظمة.
- تجربة بصرية ووظيفية متطابقة بنسبة 1:1 مع تطبيق **Beeper** المرجعي.
- بنية برمجية مستقلة بالكامل 100% مع أمان وتشفير محلي شامل بدون خوادم طرف ثالث وسيطة.
- دعم كامل ومتكامل للغتين العربية والإنجليزية مع التبديل اللحظي بنقرة واحدة وضبط ديناميكي لاتجاه النصوص (RTL / LTR).

### 🇺🇸 In English:
**Mohivx Messenger** is the definitive unified messaging desktop application engineered for **Windows 11**. The core philosophy of the project is to **unify all your chat networks and conversations into a single, high-performance inbox**:
- Stop juggling dozens of individual desktop apps (WhatsApp, Telegram, Discord, Slack, Signal, Instagram, Google Messages, Facebook Messenger, and more).
- All your contacts, threads, and incoming messages live inside a cohesive, ultra-responsive workspace.
- 1:1 visual and UX parity with **Beeper** on Windows 11.
- Fully independent, from-scratch architecture with 100% local encryption and zero third-party telemetry or middleware servers.
- Native bilingual support (Arabic & English) with instant toggle and dynamic bidirectional layout handling (`RTL / LTR`).

---

## ✨ المميزات الرئيسية | Core Features

### 1. صندوق الوارد الموحد (Unified Multi-Network Inbox)
- عرض موحد لجميع الرسائل الواردة من مختلف المنصات في قائمة واحدة مريحة.
- فلاتر ذكية لتصفية المحادثات حسب الشبكة (Telegram, WhatsApp, Discord, Slack...) أو حسب النوع (غير مقروءة، الأرشيف، التنبيهات، الطلبات).
- شريط البحث والأوامر الشامل السريع (`Ctrl + K`) للبحث في كافة المحادثات والرسائل بنقرة زر.
- نافذة بدء محادثة جديدة أو مجموعة عبر أي شبكة متصلة (`Ctrl + N`).

### 2. تطابق بصري كامل 1:1 مع Beeper (1:1 Visual Parity)
- **Left Rail (68px):** شريط تنقل جانبي رفيع يحتوي على أيقونات الحسابات والمنصات، مؤشرات الرسائل غير المقروءة، زر إضافة حساب جديد، وزر الإعدادات.
- **Thread List (252px):** قائمة المحادثات المتطابقة مع فلاتر Beeper المنسدلة (Inbox, Archive, Reminders, Requests, Low Priority).
- **Conversation Pane:** تصميم بطاقة المحادثة المظلمة المنحنية، فقاعات الرسائل الدقيقة، مؤشرات الحالة، وشريط كتابة الرسائل المتكامل مع شارة المنصة النشطة.

### 3. دعم كامل للغتين (Arabic & English Bilingual Support)
- واجهة ثنائية اللغة بالكامل تدعم التبديل اللحظي بنقرة واحدة من شاشة الإعدادات بين العربية 🇸🇦 والإنجليزية 🇺🇸.
- ضبط ديناميكي كامل لاتجاه النصوص (`RTL` و `LTR`) وحفظ التفضيل محلياً واستعادته تلقائياً.

### 4. أمان محلي 100% وتخزين دائم (Local Security & Privacy)
- **قاعدة بيانات SQLite محلية:** حفظ المحادثات وجهات الاتصال وسجل الرسائل في `%APPDATA%\MohivxMessenger\storage\mohivx.sqlite`.
- **تشفير الجلسات عبر Windows DPAPI:** حماية رموز الجلسات ومفاتيح الاعتماد بواسطة `safeStorage` المدمج في نظام Windows 11.
- عزل كامل للبيانات بدون أي خوادم وسيطة تتطلع على محادثاتك.

### 5. نظام الموصلات المستقلة (Modular Connectors Architecture)
- محرك موصلات نمطي يدعم التوسع المستمر لكافة المنصات.
- تكامل حي ومباشر عبر بروتوكول MTProto لتيليجرام مع تدفق الدخول الكامل (OTP و 2FA) ومزامنة الرسائل الحية.

---

## 🚀 التنزيل والتثبيت | Download & Installation

يمكنك تنزيل أحدث إصدار تنفيذي لنظام Windows 11 من صفحة [GitHub Releases v1.1.0](https://github.com/Mohivx/Mohivx-Messenger/releases/tag/v1.1.0):

| الملف / File | النوع / Type | الوصف / Description |
| :--- | :--- | :--- |
| **Mohivx-Messenger-Setup-1.1.0.exe** | مثبت NSIS الكامل | مثبت رسمي متكامل مع اختصارات سطح المكتب وقائمة Start وخيار إلغاء التثبيت. |
| **Mohivx-Messenger-Portable-1.1.0.exe** | النسخة المحمولة (Portable) | ملف تنفيذي مستقل يعمل مباشرة بنقرة واحدة دون الحاجة إلى تثبيت. |

---

## 🛠️ البناء من المصدر | Building from Source

```bash
# 1. استنساخ المستودع / Clone the repository
git clone https://github.com/Mohivx/Mohivx-Messenger.git
cd Mohivx-Messenger

# 2. تثبيت الحزم / Install dependencies
npm install

# 3. تشغيل وضع التطوير / Run development mode
npm run dev

# 4. بناء المشروع / Build project
npm run build

# 5. تجميع ملفات التثبيت لـ Windows / Package Windows Installers
npm run dist:win
```

---

## 🏛️ المعمارية البرمجية | Architecture

```text
Mohivx Messenger
├── assets/                    # الأيقونات والشعارات الرسمية بجميع المقاسات
├── electron/                  # محرك النظام لنظام Windows 11
│   ├── main.ts                # إدارة النوافذ، الأيقونات، AppUserModelId، و IPC
│   ├── preload.ts             # جسر العزل الآمن للواجهة
│   ├── connectors/            # نظام موصلات المنصات المستقلة
│   └── database/              # محرك التخزين الدائم المحلي SQLite
├── src/                       # واجهة المستخدم (React + TypeScript + Tailwind)
│   ├── components/            # مكونات الواجهة المطابقة لـ Beeper
│   ├── i18n/                  # نظام الترجمة المزدوجة (Arabic + English)
│   ├── types/                 # تعريفات النماذج والأنواع المشتركة
│   └── data/                  # الإعدادات وقوائم المنصات
└── package.json               # إعدادات التجميع والتثبيت لـ Windows
```

---

## 📄 الترخيص والحقوق | License & Attribution

- **المطور / Developer:** [Mohivx](https://github.com/Mohivx)
- **الترخيص / License:** MIT License
- جميع الأكواد البرمجية والمعمارية مطورة ومكتوبة بشكل مستقل بالكامل لصالح **Mohivx**.
