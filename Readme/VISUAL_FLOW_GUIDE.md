# Complete Authentication & Profile System - Visual Flow Guide

## User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   REGISTRATION PAGE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Account Type Toggle                                │  │
│  │  [User]  [Health Centre]                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  User Registration Form:                                   │
│  • Full Name                                              │
│  • Email                                                  │
│  • Phone                                                  │
│  • Password                                               │
│  • Date of Birth (for users only)                        │
│  • Gender (for users only)                               │
│                                                             │
│           ┌──────────────────┐                            │
│           │  Register Button │                            │
│           └──────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
              POST /users/register/user
              {
                email, password, full_name,
                phone, language_preference,
                profile: {
                  date_of_birth, gender
                }
              }
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND                                  │
│  1. Validate data                                          │
│  2. Hash password                                          │
│  3. Create user record                                     │
│  4. Create profile record (atomically)                     │
│  5. Generate access_token (JWT)                            │
│  6. Set HTTP-only cookie                                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
              Response:
              {
                "access_token": "eyJhbGc...",
                "token_type": "bearer",
                "user": {
                  "uuid": "abc-123",
                  "email": "user@example.com",
                  "full_name": "John Doe",
                  "phone": "+20123456789",
                  "role": "user",
                  "is_active": true
                }
              }
                         ↓
┌─────────────────────────────────────────────────────────────┐
│            FRONTEND - LOGIN & STORE                         │
│  1. Store access_token in localStorage                     │
│  2. Store user data in Zustand auth store                  │
│  3. Mark as isAuthenticated: true                          │
│  4. Redirect to /dashboard                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
            ┌────────────────────────┐
            │   DASHBOARD PAGE       │
            │  Welcome! John Doe    │
            └────────────────────────┘
```

## Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN PAGE                               │
│                                                             │
│  Email: [________________]                                 │
│  Password: [________________]                               │
│                                                             │
│           ┌──────────────┐                                 │
│           │  Login Button│                                 │
│           └──────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
              POST /users/login
              {
                "email": "user@example.com",
                "password": "secret123"
              }
                         ↓
         Backend validates credentials
                         ↓
         If valid: Generate token & user
         If invalid: 401 Unauthorized
                         ↓
         ┌─────────────────────────────┐
         │    Success Response         │
         │ (Same as registration)      │
         │ access_token + user data    │
         └─────────────────────────────┘
                         ↓
         localStorage.setItem(
           'access_token',
           'eyJhbGc...'
         )
                         ↓
         authStore.login(user)
                         ↓
         Navigate to /dashboard
```

## Profile Modal - View Mode

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR                                                  │
│  [Menu] [Bell] [Language]  [Name ▼]  [Avatar] [Logout] │
│                                ↓ (click avatar)          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ╔════════════════════════════════════════════╗  │ │
│  │  ║  My Profile                              X ║  │ │
│  │  ╚════════════════════════════════════════════╝  │ │
│  │                                                 │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │ [J]  John Doe                          │  │ │
│  │  │      john@example.com                   │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  │                                                 │ │
│  │  EMAIL: john@example.com                       │ │
│  │  PHONE: +20 123 456 789                        │ │
│  │  ROLE: USER                                     │ │
│  │                                                 │ │
│  │  ─────── MEDICAL INFORMATION ────────           │ │
│  │                                                 │ │
│  │  BLOOD TYPE: O+                                │ │
│  │  GENDER: Male                                  │ │
│  │  HEIGHT: 180 cm                                │ │
│  │  WEIGHT: 75 kg                                 │ │
│  │  ALLERGIES: Penicillin                        │ │
│  │                                                 │ │
│  │  ┌──────────────┬──────────────┐              │ │
│  │  │ Edit Profile │   Close      │              │ │
│  │  └──────────────┴──────────────┘              │ │
│  │                                                 │ │
│  │  ╚════════════════════════════════════════════╝ │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Profile Modal - Edit Mode

```
┌──────────────────────────────────────────────────────────┐
│  ╔════════════════════════════════════════════╗          │
│  ║  My Profile                              X ║          │
│  ╚════════════════════════════════════════════╝          │
│                                                 │         │
│  [J]  John Doe                          │         │
│       john@example.com                  │         │
│                                                 │         │
│  EMAIL: john@example.com                      │         │
│  PHONE: +20 123 456 789                       │         │
│  ROLE: USER                                    │         │
│                                                 │         │
│  ─────── MEDICAL INFORMATION ─────────        │         │
│                                                 │         │
│  BLOOD TYPE: [O+____________]                 │         │
│  GENDER: Male                                  │         │
│  HEIGHT: [180____________]                    │         │
│  WEIGHT: [75_____________]                    │         │
│  ALLERGIES: [Penicillin____]                  │         │
│  CHRONIC CONDITIONS: [None_]                   │         │
│  EMERGENCY CONTACT:                            │         │
│    [Jane Doe_____]                             │         │
│    [+20987654321_]                             │         │
│                                                 │         │
│  ┌─────────────────┬──────────────┐           │         │
│  │ Save Changes ✓  │  Cancel      │           │         │
│  └─────────────────┴──────────────┘           │         │
│                                                 │         │
│  ╚════════════════════════════════════════════╝          │
└──────────────────────────────────────────────────────────┘
          ↓
    PATCH /users/me/profile
    {
      "blood_type": "O+",
      "height": "180",
      "weight": "75",
      ...
    }
          ↓
    Backend updates profile
          ↓
    "Profile updated successfully" ✓
          ↓
    Modal re-fetches data
          ↓
    Displays updated profile
```

## Session Management - Page Refresh

```
┌─────────────────────────────────────────────────────────┐
│                  USER REFRESHES PAGE                     │
│                        F5                                │
└─────────────────────────────────────────────────────────┘
                         ↓
              useAuthInit Hook Runs
                         ↓
         Check localStorage for 'access_token'
                         ↓
        Is token found?  YES ─────→ Make GET /users/me
                         │          with Bearer token
                         │              ↓
                        NO      Backend validates token
                         │              ↓
                         │      Is valid? → YES → Return user
                         │                        data
                         │                         ↓
                         │      Is valid? → NO  → 401 Error
                         │                         ↓
                         └──────────── logout()
                                    ↓
                   Clear localStorage['access_token']
                   Clear authStore.user
                   Redirect to /login
                                    ↓
        Set authStore.user = response
        Set isAuthenticated = true
                         ↓
        Dashboard loads with user data
        Profile modal ready to use
```

## Logout Flow

```
┌──────────────────────────────────────────────────────────┐
│               NAVBAR LOGOUT BUTTON                        │
│                      │                                    │
│                      ↓                                    │
│           POST /users/logout                             │
│           Headers: Authorization: Bearer <token>         │
│                      │                                    │
│                      ↓                                    │
│           Backend invalidates token/cookie               │
│                      │                                    │
│                      ↓                                    │
│        Frontend Actions:                                 │
│  1. authStore.logout()                                   │
│  2. localStorage.removeItem('access_token')              │
│  3. Navigate to /login                                   │
│                      │                                    │
│                      ↓                                    │
│        ProtectedRoute checks isAuthenticated             │
│        Redirects all routes to /login                    │
│                      │                                    │
│                      ↓                                    │
│              LOGIN PAGE SHOWN                            │
└──────────────────────────────────────────────────────────┘
```

## API Request Headers

### Protected Requests (Authenticated)

```
GET /users/me
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Cookie: session_id=abc123... (HTTP-only)

PATCH /users/me/profile
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Cookie: session_id=abc123... (HTTP-only)
```

### Public Requests (Unauthenticated)

```
POST /users/register/user
Content-Type: application/json

POST /users/login
Content-Type: application/json
```

## Error Handling

### Invalid Token
```
GET /users/me
Status: 401 Unauthorized
Response: {"detail": "Invalid token"}

Frontend Action:
1. Clear localStorage['access_token']
2. Clear authStore
3. Redirect to /login
```

### Network Error
```
GET /users/me
Status: Network Error

Frontend Action:
1. Keep user logged in (assume token valid)
2. Retry on next action
3. Show offline indicator
```

### Invalid Credentials
```
POST /users/login
Status: 401 Unauthorized
Response: {"detail": "Invalid email or password"}

Frontend Action:
Show error message in login form
```

## Component Hierarchy

```
App
├── LanguageProvider
│   └── LocaleWrapper
│       ├── AuthLayout
│       │   ├── LoginPage
│       │   │   └── AccountTypeToggle
│       │   └── RegisterPage
│       │       └── AccountTypeToggle
│       │
│       └── ProtectedRoute
│           └── AppLayout
│               ├── TopNav
│               │   └── ProfileModal ★ NEW
│               │       └── (Edit/View Profile)
│               ├── Sidebar
│               └── Routes (Dashboard, etc.)
```

## State Management

```
Zustand authStore
├── user: User | null
│   ├── uuid
│   ├── email
│   ├── full_name
│   ├── phone
│   ├── role
│   └── is_active
├── isAuthenticated: boolean
├── isLoading: boolean
└── error: string | null

localStorage
├── auth-store (persisted Zustand state)
└── access_token (JWT token)

ProfileModal (local state)
├── profile: UserWithProfile
├── isLoading: boolean
├── isEditing: boolean
├── error: string
├── successMessage: string
└── editData: { ... }
```

## Data Validation

### Registration
- Email: valid email format
- Password: non-empty
- Full Name: non-empty
- Phone: non-empty
- Date of Birth: valid date (YYYY-MM-DD)
- Gender: male/female/other

### Profile Edit
- Blood Type: string (optional)
- Height: numeric (optional)
- Weight: numeric (optional)
- Allergies: string (optional)
- Emergency Contact: name + phone (optional)

## Performance Considerations

✓ Profile loads on-demand (not on page load)
✓ No polling for updates
✓ Caching via browser + Zustand
✓ Efficient re-renders with React hooks
✓ Modal lazy-loads profile data
✓ Debounced form saves (optional)

## Security Summary

✓ JWT tokens validated on backend
✓ HTTP-only cookies for session
✓ Bearer tokens for API requests
✓ Token expiration enforced
✓ CORS credentials enabled
✓ localStorage as fallback only
✓ Automatic logout on invalid token
✓ All protected routes validated
