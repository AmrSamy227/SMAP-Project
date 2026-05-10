# كتاب مشروع التخرج
## نظام إدارة الرعاية الصحية الذكي — SMAP

---

## 1. عنوان المشروع (Project Title)

**SMAP — منصة الرعاية الصحية الذكية**
نظام متكامل لإدارة الحجوزات الطبية والتشخيص بالذكاء الاصطناعي

---

## 2. المقدمة (Introduction)

SMAP هي منصة رعاية صحية رقمية متكاملة تهدف إلى ربط المرضى بالأطباء والعيادات بشكل سلس وذكي. يجمع النظام بين إدارة الحجوزات الطبية وخدمات التشخيص المدعومة بالذكاء الاصطناعي في واجهة مستخدم واحدة تدعم اللغتين العربية والإنجليزية.

### أهمية المشروع
- تسهيل وصول المرضى إلى الرعاية الصحية رقمياً دون الحاجة للانتظار
- توفير تشخيص أولي سريع بالذكاء الاصطناعي
- تنظيم العمل الطبي للعيادات والأطباء
- حفظ السجلات الطبية إلكترونياً بصورة آمنة

### المشكلة التي يعالجها
- صعوبة حجز المواعيد الطبية تقليدياً
- غياب منصة موحدة تجمع مرضى وأطباء وعيادات
- عدم توفر تشخيص أولي سريع قبل زيارة الطبيب

---

## 3. مشكلة المشروع (Problem Statement)

يعاني النظام الصحي التقليدي من:
1. **إدارة الحجوزات يدوياً** مما يسبب أخطاء وفوضى في الجداول
2. **غياب التواصل الرقمي** بين المريض والطاقم الطبي
3. **ضياع السجلات الطبية** وصعوبة تتبع التاريخ المرضي
4. **صعوبة التشخيص المبكر** وارتفاع تكاليف الزيارات غير الضرورية
5. **عدم توفر نظام تقييم** للأطباء يساعد المرضى على اختيار الأفضل

---

## 4. أهداف المشروع (Objectives)

| # | الهدف | مقياس النجاح |
|---|-------|--------------|
| 1 | إنشاء نظام تسجيل ومصادقة آمن متعدد الأدوار | 3 أدوار: مريض، عيادة، طبيب |
| 2 | تطوير نظام حجز مواعيد متكامل | دورة حياة كاملة: pending → confirmed → completed |
| 3 | دمج نموذج AI للتنبؤ بمرض السكري | دقة > 80% باستخدام نموذج scikit-learn |
| 4 | دمج AI لتحليل صور الأشعة السينية | كشف: طبيعي / التهاب رئوي / كوفيد |
| 5 | توفير محادثة ذكية للتشخيص الأولي | جلسات chat مع LLM |
| 6 | بناء واجهة مستخدم ثنائية اللغة | AR / EN مع دعم RTL |
| 7 | حفظ السجلات الطبية الإلكترونية | تحديث تلقائي بعد كل تشخيص |

---

## 5. منهجية العمل — تحليل النظام (System Analysis / Methodology)

### منهجية التطوير
اتبع الفريق منهجية **Agile** مقسمة على 3 مراحل:

**المرحلة الأولى — البنية التحتية والمصادقة:**
- تصميم قاعدة البيانات والنماذج
- نظام تسجيل دخول JWT
- إدارة الأدوار RBAC

**المرحلة الثانية — خدمات الذكاء الاصطناعي:**
- نموذج تنبؤ السكري
- تحليل الأشعة السينية
- المحادثة الذكية

**المرحلة الثالثة — نظام الحجز:**
- إدارة الجدول الزمني للأطباء
- حجز المواعيد وإدارتها
- التقييمات والفواتير

### الأدوات والتقنيات

| الجانب | التقنية |
|--------|---------|
| **الواجهة الأمامية** | React 18, TypeScript, Vite, Tailwind CSS |
| **إدارة الحالة** | Zustand |
| **الرسوم البيانية** | Recharts |
| **التحريك** | Framer Motion |
| **الواجهة الخلفية** | FastAPI (Python) |
| **قاعدة البيانات** | SQLite + SQLAlchemy ORM |
| **المصادقة** | JWT (PyJWT) |
| **الذكاء الاصطناعي** | scikit-learn, joblib, pandas |
| **التشغيل** | Uvicorn |
| **API** | RESTful JSON API (74 endpoint) |
| **التنقل** | React Router DOM v6 |
| **الترجمة** | Custom i18n Context (AR/EN) |

---

## 6. تصميم النظام (System Design)

### المعمارية العامة (Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                  React Frontend (Vite)                  │
│  Pages: Landing, Auth, Dashboard, Booking, Diagnose,    │
│         Chat, Records, Profile, Clinic, Doctor, Admin   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST API
┌──────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (Python)                   │
│  Routers: users, doctors, clinics, bookings, slots,     │
│           availability, analysis, xray, chat,           │
│           records, roles, audit, specializations        │
└──────────────────────┬──────────────────────────────────┘
                       │ SQLAlchemy ORM
┌──────────────────────▼──────────────────────────────────┐
│              SQLite Database (grad_db.db)               │
│  Tables: 20+ tables covering all system entities        │
└─────────────────────────────────────────────────────────┘
```

### الأدوار في النظام (Roles)

| الدور | الصلاحيات |
|-------|-----------|
| **user (مريض)** | حجز مواعيد، تشخيص AI، سجلات طبية، تقييم أطباء |
| **clinic (عيادة)** | إدارة الأطباء، تأكيد الحجوزات، الجدول الزمني |
| **doctor (طبيب)** | مواعيد، دعوات العيادات، المرضى |


### تصميم قاعدة البيانات — الجداول الرئيسية

```
users ──────────── user_profiles
  │                    
  ├── clinics ──── doctor_clinics ──── doctors
  │                                      │
  │                              doctor_availability
  │                                      │
  │                              appointment_slots
  │                                      │
  └── bookings ─────────────────────────┘
       │
       ├── appointment_notes
       ├── doctor_ratings
       └── appointment_roles

users ──── medical_records ──── record_type
  │
  ├── diagnostics ──── diagnostic_results
  ├── radiology ──── radiology_findings
  └── chat_sessions ──── chat_messages ──── symptom_tags

users ──── audit_log
users ──── user_roles ──── roles
```

### مخطط تدفق الحجز (Booking Flowchart)

```
المريض يبحث عن طبيب
        ↓
يختار موعداً متاحاً (available slot)
        ↓
يُنشئ حجزاً → الحالة: pending
        ↓
العيادة/الطبيب يؤكد → الحالة: confirmed
        ↓
تتم الزيارة → الحالة: completed
        ↓
المريض يُقيّم الطبيب (1-5 نجوم)
```

### دورة حياة الحجز (State Machine)

```
pending → confirmed → completed
   ↓           ↓
cancelled   cancelled
```

---

## 7. التنفيذ (Implementation)

### الواجهة الأمامية (Frontend)

**هيكل المشروع:**
```
src/
├── App.tsx              # التوجيه الرئيسي
├── pages/
│   ├── landing/         # الصفحة الرئيسية
│   ├── auth/            # تسجيل الدخول والتسجيل
│   ├── dashboard/       # لوحة التحكم
│   ├── booking/         # الحجز والأطباء
│   ├── diagnose/        # التشخيص بالذكاء الاصطناعي
│   ├── chat/            # المحادثة الذكية
│   ├── records/         # السجلات الطبية
│   ├── profile/         # الملف الشخصي
│   ├── clinic/          # إدارة العيادة
│   ├── doctor/          # لوحة الطبيب
│   └── admin/           # لوحة المسؤول
├── components/          # المكونات المشتركة
├── lib/
│   ├── api/             # خدمات API
│   ├── store/           # Zustand stores
│   └── i18n/            # الترجمة AR/EN
└── hooks/               # React hooks مخصصة
```

**الصفحات الرئيسية:**
- **LandingPage**: الصفحة الترحيبية مع نظرة عامة على الخدمات
- **LoginPage / RegisterPage**: تسجيل دخول وتسجيل متعدد الأدوار
- **DashboardPage**: لوحة تحكم مخصصة لكل دور
- **DoctorListingPage**: عرض وبحث الأطباء حسب التخصص
- **BookingConfirmPage**: تأكيد الحجز مع تفاصيل الموعد
- **MyBookingsPage**: قائمة حجوزات المريض
- **DiabetesPage**: نموذج التنبؤ بالسكري
- **XrayPage**: رفع وتحليل صور الأشعة
- **ChatPage**: المحادثة الذكية
- **RecordsTimelinePage**: السجل الطبي الزمني

### الواجهة الخلفية (Backend)

**هيكل المشروع:**
```
graduation-back/
├── main.py              # نقطة الدخول FastAPI
├── database.py          # اتصال قاعدة البيانات
├── models.py            # نماذج SQLAlchemy (20+ جدول)
├── schemas.py           # Pydantic schemas
├── utils.py             # JWT، تشفير كلمات المرور
├── medical_record_service.py  # خدمة السجلات
├── routers/
│   ├── users.py         # المصادقة وإدارة المستخدمين
│   ├── doctors.py       # إدارة الأطباء
│   ├── clinics.py       # إدارة العيادات
│   ├── bookings.py      # نظام الحجز
│   ├── slots.py         # الفترات الزمنية
│   ├── availability.py  # جداول الأطباء
│   ├── analysis.py      # تشخيص السكري AI
│   ├── xray.py          # تحليل الأشعة AI
│   ├── chat.py          # المحادثة الذكية
│   ├── medical_records.py # السجلات الطبية
│   ├── specializations.py # التخصصات الطبية
│   ├── roles.py         # إدارة الأدوار
│   └── audit.py         # سجلات التدقيق
└── SQL/                 # ملفات SQL
```

**نموذج المصادقة:**
```python
# JWT Token — صالح لـ 30 دقيقة
Authorization: Bearer <access_token>

# الأدوار المدعومة:
RoleEnum: user | clinic | doctor | admin
```

**نموذج AI للسكري:**
```python
# المدخلات:
pregnancies, glucose, blood_pressure, skin_thickness,
insulin, bmi, diabetes_pedigree_function, age

# المخرجات:
{ "prediction": 0/1, "confidence": 0.0-1.0 }
```

**نموذج AI للأشعة:**
```python
# المدخلات: صورة JPEG/PNG
# المخرجات:
{ "finding_name": "normal/pneumonia/covid", "confidence_score": float }
```

### واجهة برمجة التطبيقات API (74 endpoint)

| الوحدة | عدد الـ Endpoints | الوصف |
|--------|-------------------|-------|
| Users | 18 | التسجيل، الدخول، الملف الشخصي |
| Specializations | 5 | التخصصات الطبية |
| Doctors | 7 | إدارة الأطباء والدعوات |
| Clinics | 7 | إدارة العيادات وربط الأطباء |
| Availability | 4 | الجداول الزمنية المتكررة |
| Slots | 6 | الفترات القابلة للحجز |
| Bookings | 11 | دورة حياة الحجز الكاملة |
| Medical Records | 3 | السجلات الطبية |
| AI Analysis | 1 | تشخيص السكري |
| X-Ray | 1 | تحليل الأشعة |
| Chat | 4 | جلسات المحادثة الذكية |
| Roles | 5 | إدارة الأدوار RBAC |
| Audit | 2 | سجلات التدقيق |

---

## 8. الاختبار والتقييم (Testing & Evaluation)

### أنواع الاختبارات المنفذة

**اختبار الـ API التلقائي:**
```bash
# test_automation.py — اختبار شامل للدورة الكاملة
python test_automation.py
python test_automation_full.py
```

**سيناريوهات الاختبار:**

| السيناريو | النتيجة |
|-----------|---------|
| تسجيل مريض جديد | ✅ نجح |
| تسجيل عيادة وطبيب | ✅ نجح |
| دعوة طبيب للعيادة وقبولها | ✅ نجح |
| إنشاء جداول متاحة وتوليد مواعيد | ✅ نجح |
| حجز موعد → تأكيد → إتمام | ✅ نجح |
| تشخيص السكري بـ AI | ✅ نجح |
| تحليل الأشعة السينية | ✅ نجح |
| تقييم الطبيب وتحديث المتوسط | ✅ نجح |
| استرجاع السجل الطبي | ✅ نجح |
| سجلات التدقيق (Audit) | ✅ نجح |

**اختبار الواجهة:**
- تجربة تدفق المستخدم لجميع الأدوار
- التحقق من دعم اللغتين العربية والإنجليزية
- التحقق من عمل الحماية (ProtectedRoute)
- اختبار الاستجابة على أحجام شاشات مختلفة

---

## 9. النتائج (Results)

### ما تم تحقيقه

✅ **نظام مصادقة متكامل** بـ JWT وأدوار متعددة (4 أدوار)

✅ **74 نقطة API** تغطي جميع وظائف النظام

✅ **20+ جدول** في قاعدة البيانات مع علاقات معقدة

✅ **نموذج AI للسكري** يعمل بثقة عالية

✅ **نموذج AI للأشعة** يكشف: طبيعي، التهاب رئوي، كوفيد

✅ **نظام حجز كامل** بدورة حياة من 4 حالات

✅ **واجهة ثنائية اللغة** (عربي/إنجليزي) مع دعم RTL

✅ **13 صفحة** تغطي جميع وظائف النظام

✅ **لوحة مسؤول** مع سجلات تدقيق كاملة

✅ **سجلات طبية** تُحدَّث تلقائياً بعد كل تشخيص

### مؤشرات الأداء

| المؤشر | القيمة |
|--------|--------|
| إجمالي نقاط الـ API | 74 endpoint |
| جداول قاعدة البيانات | 20+ جدول |
| صفحات الواجهة | 13 صفحة |
| أدوار المستخدمين | 4 أدوار |
| نماذج الذكاء الاصطناعي | 2 نموذج |
| حالات الاختبار | 10+ سيناريو |
| اللغات المدعومة | 2 (عربي/إنجليزي) |

---

## 10. المناقشة (Discussion)

### نقاط القوة
1. **معمارية متكاملة**: فصل واضح بين الواجهة الأمامية والخلفية
2. **RBAC متقدم**: نظام صلاحيات دقيق لكل دور
3. **AI مدمج**: نماذج ذكاء اصطناعي حقيقية ليست مجرد واجهة
4. **تعدد اللغات**: دعم كامل للعربية مع RTL
5. **قابلية التوسع**: البنية تسمح بإضافة ميزات جديدة بسهولة
6. **سجل التدقيق**: تتبع كامل لجميع العمليات

### نقاط الضعف
1. **قاعدة بيانات SQLite**: مناسبة للتطوير، لكنها تحتاج للترقية إلى PostgreSQL في الإنتاج
2. **مصادقة OAuth**: مُعرَّفة في النماذج لكن غير مفعّلة بالكامل
3. **التخزين السحابي**: الملفات تُحفظ محلياً (uploads/)
4. **الإشعارات**: لا يوجد نظام إشعارات فوري
5. **الدفع الإلكتروني**: الفاتورة موجودة لكن لا يوجد بوابة دفع

---

## 11. الخاتمة (Conclusion)

نجح مشروع SMAP في بناء منصة رعاية صحية رقمية متكاملة تجمع بين:
- **إدارة الحجوزات** الطبية بنظام دورة حياة متكامل
- **الذكاء الاصطناعي** للتشخيص المبكر لمرض السكري وتحليل الأشعة
- **المحادثة الذكية** للاستشارة الطبية الأولية
- **السجلات الطبية الرقمية** التي تُحدَّث تلقائياً
- **واجهة مستخدم** ثنائية اللغة تراعي ثقافة المستخدم العربي

يُمثل هذا المشروع نموذجاً متكاملاً لتطبيق Full-Stack حديث يجمع بين هندسة البرمجيات وتقنيات الذكاء الاصطناعي لخدمة قطاع الرعاية الصحية.

---

## 12. التوصيات (Recommendations)

1. **الترقية إلى PostgreSQL** لقاعدة بيانات أكثر قدرة في الإنتاج
2. **إضافة بوابة دفع** إلكتروني (مثل Stripe أو Paymob)
3. **تطوير تطبيق موبايل** باستخدام React Native
4. **إضافة نظام إشعارات** فوري باستخدام WebSockets
5. **تفعيل تسجيل الدخول** بحسابات Google/Apple (OAuth)
6. **تحسين نماذج AI** بمزيد من البيانات الطبية المتنوعة
7. **إضافة خدمة الاستشارة** عبر الفيديو (Telemedicine)
8. **نشر النظام** على خادم سحابي (AWS / Azure)
9. **إضافة تشفير** للبيانات الطبية الحساسة (HIPAA compliance)
10. **توسيع نماذج AI** لتشمل تشخيص أمراض أخرى

---

## 13. المراجع (References)

1. **FastAPI Documentation** — https://fastapi.tiangolo.com
2. **React Documentation** — https://react.dev
3. **SQLAlchemy ORM** — https://docs.sqlalchemy.org
4. **Scikit-learn** — https://scikit-learn.org
5. **Zustand State Management** — https://github.com/pmndrs/zustand
6. **React Router v6** — https://reactrouter.com
7. **Pydantic v2** — https://docs.pydantic.dev
8. **Tailwind CSS** — https://tailwindcss.com
9. **Framer Motion** — https://www.framer.com/motion
10. **JWT Authentication** — https://jwt.io
11. **Pima Indians Diabetes Dataset** — UCI Machine Learning Repository
12. **Chest X-Ray Images Dataset** — Kaggle (Paul Mooney)

---

## 14. الملاحق (Appendices)

### الملحق أ — هيكل قاعدة البيانات (جداول النظام)

| اسم الجدول | الوصف |
|-----------|-------|
| `users` | المستخدمون الأساسيون (مريض/عيادة/طبيب/مسؤول) |
| `user_profiles` | الملف الصحي للمريض |
| `clinics` | بيانات العيادات |
| `doctors` | بيانات الأطباء |
| `doctor_clinics` | علاقة طبيب-عيادة (many-to-many) |
| `clinic_doctor_invitations` | دعوات الانضمام للعيادة |
| `specializations` | التخصصات الطبية |
| `doctor_availability` | الجداول الأسبوعية المتكررة |
| `appointment_slots` | الفترات الزمنية القابلة للحجز |
| `bookings` | الحجوزات الطبية |
| `appointment_notes` | ملاحظات المواعيد |
| `appointment_roles` | أدوار المشاركين في الحجز |
| `doctor_ratings` | تقييمات الأطباء |
| `booking_sources` | مصادر الحجز |
| `medical_records` | السجلات الطبية (JSON) |
| `record_type` | أنواع السجلات |
| `diagnostics` | نتائج تشخيص السكري |
| `diagnostic_results` | نتيجة نموذج AI |
| `radiology` | صور الأشعة السينية |
| `radiology_findings` | نتائج تحليل الأشعة |
| `chat_sessions` | جلسات المحادثة الذكية |
| `chat_messages` | رسائل المحادثة |
| `symptom_tags` | الأعراض المستخرجة من المحادثة |
| `roles` | الأدوار الدقيقة (RBAC) |
| `user_roles` | ربط المستخدمين بالأدوار |
| `sessions` | جلسات المستخدمين |
| `oauth_accounts` | حسابات OAuth |
| `audit_log` | سجل تدقيق كامل |

### الملحق ب — نقاط الـ API الرئيسية

```
# المصادقة
POST /users/register/user     — تسجيل مريض
POST /users/register/clinic   — تسجيل عيادة
POST /users/register/doctor   — تسجيل طبيب
POST /users/login             — تسجيل الدخول (JWT)
GET  /users/me                — بيانات المستخدم الحالي

# الحجز
GET  /appointment-slots/      — البحث عن مواعيد متاحة
POST /bookings/               — إنشاء حجز
PATCH /bookings/{id}/confirm  — تأكيد الحجز
PATCH /bookings/{id}/complete — إتمام الحجز
PATCH /bookings/{id}/cancel   — إلغاء الحجز
PATCH /bookings/{id}/rate     — تقييم الطبيب

# الذكاء الاصطناعي
POST /analysis/run            — تشخيص السكري
POST /xray/upload             — تحليل الأشعة

# السجلات
GET  /records/me              — السجل الطبي

# المحادثة
POST /chat/sessions           — بدء محادثة جديدة
POST /chat/sessions/{id}/messages — إرسال رسالة
```

### الملحق ج — متطلبات التشغيل

**الواجهة الخلفية:**
```bash
pip install fastapi uvicorn sqlalchemy PyJWT python-dotenv
pip install passlib[bcrypt] pydantic email-validator
pip install pandas joblib scikit-learn
python main.py  # يعمل على http://localhost:8000
```

**الواجهة الأمامية:**
```bash
npm install
npm run dev  # يعمل على http://localhost:5173
```

**متغيرات البيئة (.env):**
```
SECRET_KEY=<jwt-secret>
ALGORITHM=HS256
DATABASE_URL=sqlite:///./grad_db.db
```

---

*تم إعداد هذا التقرير استناداً إلى الكود المصدري الكامل للمشروع ووثيقة API الشاملة*
