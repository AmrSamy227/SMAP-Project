# Graduation Project Book
## SMAP — Intelligent Healthcare Management System

---

## 1. Project Title

**SMAP — Smart Healthcare Platform**
An integrated system for medical appointment booking and AI-powered diagnostics

---

## 2. Introduction

SMAP is a comprehensive digital healthcare platform designed to seamlessly connect patients with doctors and clinics. The system combines medical appointment management with AI-powered diagnostic services in a single user interface that supports both Arabic and English languages.

### Project Significance
- Facilitating patient access to healthcare digitally without waiting
- Providing fast preliminary AI diagnosis
- Organizing medical work for clinics and doctors
- Securely storing medical records electronically

### Problem Addressed
- Difficulty booking medical appointments through traditional methods
- Absence of a unified platform connecting patients, doctors, and clinics
- Lack of rapid preliminary diagnosis before visiting a doctor

---

## 3. Problem Statement

The traditional healthcare system suffers from:
1. **Manual appointment management** causing errors and scheduling chaos
2. **Lack of digital communication** between patients and medical staff
3. **Loss of medical records** and difficulty tracking medical history
4. **Limited early diagnosis** and high costs of unnecessary visits
5. **No doctor rating system** to help patients choose the best physician

---

## 4. Objectives

| # | Objective | Success Metric |
|---|-----------|----------------|
| 1 | Build a secure multi-role registration and authentication system | 4 roles: patient, clinic, doctor, admin |
| 2 | Develop a complete appointment booking system | Full lifecycle: pending → confirmed → completed |
| 3 | Integrate an AI model for diabetes prediction | Accuracy > 80% using scikit-learn |
| 4 | Integrate AI for chest X-ray analysis | Detection: Normal / Pneumonia / COVID |
| 5 | Provide an intelligent chat for preliminary diagnosis | Chat sessions with LLM |
| 6 | Build a bilingual user interface | AR / EN with RTL support |
| 7 | Store electronic medical records | Auto-updated after every diagnosis |

---

## 5. Methodology — System Analysis

### Development Methodology
The team followed an **Agile** methodology divided into 3 phases:

**Phase 1 — Infrastructure & Authentication:**
- Database design and modeling
- JWT login system
- RBAC role management

**Phase 2 — Artificial Intelligence Services:**
- Diabetes prediction model
- X-ray analysis
- Intelligent chat

**Phase 3 — Booking System:**
- Doctor schedule management
- Appointment booking and management
- Ratings and invoices

### Tools & Technologies

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **Backend** | FastAPI (Python) |
| **Database** | SQLite + SQLAlchemy ORM |
| **Authentication** | JWT (PyJWT) |
| **Artificial Intelligence** | scikit-learn, joblib, pandas |
| **Server** | Uvicorn |
| **API** | RESTful JSON API (74 endpoints) |
| **Routing** | React Router DOM v6 |
| **Localization** | Custom i18n Context (AR/EN) |

---

## 6. System Design

### Overall Architecture

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

### System Roles

| Role | Permissions |
|------|-------------|
| **user (Patient)** | Book appointments, AI diagnosis, medical records, rate doctors |
| **clinic** | Manage doctors, confirm bookings, scheduling |
| **doctor** | View appointments, clinic invitations, patients |
| **admin** | Full system management, audit logs |

### Database Design — Main Tables

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

### Booking Flowchart

```
Patient searches for a doctor
           ↓
Selects an available slot
           ↓
Creates a booking → Status: pending
           ↓
Clinic/Doctor confirms → Status: confirmed
           ↓
Appointment takes place → Status: completed
           ↓
Patient rates the doctor (1–5 stars)
```

### Booking State Machine

```
pending → confirmed → completed
   ↓           ↓
cancelled   cancelled
```

---

## 7. Implementation

### Frontend

**Project Structure:**
```
src/
├── App.tsx              # Main router
├── pages/
│   ├── landing/         # Home / landing page
│   ├── auth/            # Login & registration
│   ├── dashboard/       # Control panel
│   ├── booking/         # Booking & doctors
│   ├── diagnose/        # AI diagnostics
│   ├── chat/            # Intelligent chat
│   ├── records/         # Medical records
│   ├── profile/         # User profile
│   ├── clinic/          # Clinic management
│   ├── doctor/          # Doctor panel
│   └── admin/           # Admin panel
├── components/          # Shared components
├── lib/
│   ├── api/             # API services
│   ├── store/           # Zustand stores
│   └── i18n/            # AR/EN localization
└── hooks/               # Custom React hooks
```

**Key Pages:**
- **LandingPage**: Welcome page with an overview of services
- **LoginPage / RegisterPage**: Multi-role login and registration
- **DashboardPage**: Role-specific control panel
- **DoctorListingPage**: Browse and search doctors by specialty
- **BookingConfirmPage**: Booking confirmation with appointment details
- **MyBookingsPage**: Patient's booking list
- **DiabetesPage**: Diabetes prediction form
- **XrayPage**: X-ray image upload and analysis
- **ChatPage**: Intelligent chat
- **RecordsTimelinePage**: Medical record timeline

### Backend

**Project Structure:**
```
graduation-back/
├── main.py              # FastAPI entry point
├── database.py          # Database connection
├── models.py            # SQLAlchemy models (20+ tables)
├── schemas.py           # Pydantic schemas
├── utils.py             # JWT, password hashing
├── medical_record_service.py  # Records service
├── routers/
│   ├── users.py         # Auth & user management
│   ├── doctors.py       # Doctor management
│   ├── clinics.py       # Clinic management
│   ├── bookings.py      # Booking system
│   ├── slots.py         # Time slots
│   ├── availability.py  # Doctor schedules
│   ├── analysis.py      # Diabetes AI diagnosis
│   ├── xray.py          # X-ray AI analysis
│   ├── chat.py          # Intelligent chat
│   ├── medical_records.py # Medical records
│   ├── specializations.py # Medical specializations
│   ├── roles.py         # RBAC role management
│   └── audit.py         # Audit logs
└── SQL/                 # SQL files
```

**Authentication Model:**
```python
# JWT Token — valid for 30 minutes
Authorization: Bearer <access_token>

# Supported roles:
RoleEnum: user | clinic | doctor | admin
```

**Diabetes AI Model:**
```python
# Inputs:
pregnancies, glucose, blood_pressure, skin_thickness,
insulin, bmi, diabetes_pedigree_function, age

# Output:
{ "prediction": 0/1, "confidence": 0.0-1.0 }
```

**X-Ray AI Model:**
```python
# Input: JPEG/PNG image
# Output:
{ "finding_name": "normal/pneumonia/covid", "confidence_score": float }
```

### API Summary (74 Endpoints)

| Module | # Endpoints | Description |
|--------|-------------|-------------|
| Users | 18 | Registration, login, profile |
| Specializations | 5 | Medical specializations |
| Doctors | 7 | Doctor management & invitations |
| Clinics | 7 | Clinic management & doctor linking |
| Availability | 4 | Recurring weekly schedules |
| Slots | 6 | Bookable time slots |
| Bookings | 11 | Full booking lifecycle |
| Medical Records | 3 | Medical records |
| AI Analysis | 1 | Diabetes diagnosis |
| X-Ray | 1 | X-ray analysis |
| Chat | 4 | Chat sessions |
| Roles | 5 | RBAC role management |
| Audit | 2 | Audit logs |

---

## 8. Testing & Evaluation

### Types of Tests Performed

**Automated API Testing:**
```bash
python test_automation.py
python test_automation_full.py
```

**Test Scenarios:**

| Scenario | Result |
|----------|--------|
| Register a new patient | ✅ Passed |
| Register a clinic and doctor | ✅ Passed |
| Invite a doctor to a clinic and accept | ✅ Passed |
| Create availability rules and generate slots | ✅ Passed |
| Book → Confirm → Complete appointment | ✅ Passed |
| AI diabetes diagnosis | ✅ Passed |
| X-ray image analysis | ✅ Passed |
| Rate doctor and update average | ✅ Passed |
| Retrieve medical record | ✅ Passed |
| Audit log recording | ✅ Passed |

**UI Testing:**
- End-to-end user flow for all roles
- Verification of Arabic and English language support
- Verification of route protection (ProtectedRoute)
- Responsiveness testing across different screen sizes

---

## 9. Results

### What Was Achieved

✅ **Complete authentication system** with JWT and 4 roles

✅ **74 API endpoints** covering all system functions

✅ **20+ database tables** with complex relationships

✅ **Diabetes AI model** operating with high confidence

✅ **X-ray AI model** detecting: Normal, Pneumonia, COVID

✅ **Full booking system** with a 4-state lifecycle

✅ **Bilingual UI** (Arabic/English) with RTL support

✅ **13 pages** covering all system functions

✅ **Admin panel** with complete audit logs

✅ **Medical records** automatically updated after every diagnosis

### Performance Indicators

| Metric | Value |
|--------|-------|
| Total API endpoints | 74 |
| Database tables | 20+ |
| Frontend pages | 13 |
| User roles | 4 |
| AI models | 2 |
| Test scenarios | 10+ |
| Supported languages | 2 (Arabic / English) |

---

## 10. Discussion

### Strengths
1. **Integrated architecture**: Clear separation between frontend and backend
2. **Advanced RBAC**: Fine-grained permission system for each role
3. **Embedded AI**: Real AI models, not just a mock interface
4. **Multilingual support**: Full Arabic support with RTL
5. **Scalability**: Architecture allows easy addition of new features
6. **Audit trail**: Complete tracking of all system operations

### Weaknesses
1. **SQLite database**: Suitable for development, but needs upgrading to PostgreSQL in production
2. **OAuth authentication**: Defined in models but not fully activated
3. **Cloud storage**: Files are saved locally in `uploads/`
4. **Notifications**: No real-time notification system
5. **Electronic payment**: Invoice exists but no payment gateway

---

## 11. Conclusion

The SMAP project successfully built a comprehensive digital healthcare platform combining:
- **Appointment management** with a complete lifecycle system
- **Artificial intelligence** for early diagnosis of diabetes and X-ray analysis
- **Intelligent chat** for preliminary medical consultation
- **Digital medical records** that update automatically
- **Bilingual user interface** respecting Arabic-speaking users' culture

This project represents a complete modern Full-Stack application model combining software engineering and AI technologies to serve the healthcare sector.

---

## 12. Recommendations

1. **Upgrade to PostgreSQL** for a more capable production database
2. **Add an electronic payment gateway** (e.g., Stripe or Paymob)
3. **Develop a mobile application** using React Native
4. **Add a real-time notification system** using WebSockets
5. **Enable OAuth login** with Google/Apple accounts
6. **Improve AI models** with more diverse medical training data
7. **Add video consultation service** (Telemedicine)
8. **Deploy the system** to a cloud server (AWS / Azure)
9. **Add encryption** for sensitive medical data (HIPAA compliance)
10. **Expand AI models** to diagnose additional diseases

---

## 13. References

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

## 14. Appendices

### Appendix A — Database Schema (System Tables)

| Table Name | Description |
|-----------|-------------|
| `users` | Core users (patient/clinic/doctor/admin) |
| `user_profiles` | Patient health profile |
| `clinics` | Clinic data |
| `doctors` | Doctor data |
| `doctor_clinics` | Doctor-clinic relationship (many-to-many) |
| `clinic_doctor_invitations` | Clinic join invitations |
| `specializations` | Medical specializations |
| `doctor_availability` | Recurring weekly schedules |
| `appointment_slots` | Bookable time slots |
| `bookings` | Medical bookings |
| `appointment_notes` | Appointment notes |
| `appointment_roles` | Participant roles in a booking |
| `doctor_ratings` | Doctor ratings |
| `booking_sources` | Booking source tracking |
| `medical_records` | Medical records (JSON) |
| `record_type` | Record type taxonomy |
| `diagnostics` | Diabetes diagnosis results |
| `diagnostic_results` | AI model output |
| `radiology` | X-ray images |
| `radiology_findings` | X-ray analysis findings |
| `chat_sessions` | Intelligent chat sessions |
| `chat_messages` | Chat messages |
| `symptom_tags` | Symptoms extracted from chat |
| `roles` | Fine-grained roles (RBAC) |
| `user_roles` | User-role assignments |
| `sessions` | User sessions |
| `oauth_accounts` | OAuth accounts |
| `audit_log` | Complete audit trail |

### Appendix B — Key API Endpoints

```
# Authentication
POST /users/register/user     — Register patient
POST /users/register/clinic   — Register clinic
POST /users/register/doctor   — Register doctor
POST /users/login             — Login (JWT)
GET  /users/me                — Current user data

# Booking
GET  /appointment-slots/      — Search available slots
POST /bookings/               — Create booking
PATCH /bookings/{id}/confirm  — Confirm booking
PATCH /bookings/{id}/complete — Complete booking
PATCH /bookings/{id}/cancel   — Cancel booking
PATCH /bookings/{id}/rate     — Rate doctor

# Artificial Intelligence
POST /analysis/run            — Diabetes diagnosis
POST /xray/upload             — X-ray analysis

# Records
GET  /records/me              — Medical record

# Chat
POST /chat/sessions           — Start new chat session
POST /chat/sessions/{id}/messages — Send message
```

### Appendix C — Runtime Requirements

**Backend:**
```bash
pip install fastapi uvicorn sqlalchemy PyJWT python-dotenv
pip install passlib[bcrypt] pydantic email-validator
pip install pandas joblib scikit-learn
python main.py  # runs on http://localhost:8000
```

**Frontend:**
```bash
npm install
npm run dev  # runs on http://localhost:5173
```

**Environment Variables (.env):**
```
SECRET_KEY=<jwt-secret>
ALGORITHM=HS256
DATABASE_URL=sqlite:///./grad_db.db
```

---

*This report was prepared based on the full project source code and the comprehensive API documentation.*
