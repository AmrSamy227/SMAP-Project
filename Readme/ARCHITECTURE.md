# Authentication Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React App (Client)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   App.tsx (Root)    │
                    │  useAuthInit()      │ ← Restores user from localStorage
                    └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
   ┌──────────────┐                      ┌──────────────────┐
   │  /en/login   │                      │  /en/register    │
   │  /en/auth    │                      │  /en/auth        │
   └──────────────┘                      └──────────────────┘
        ↓                                           ↓
   ┌──────────────────────┐              ┌─────────────────────┐
   │   LoginPage.tsx      │              │ RegisterPage.tsx    │
   │ - Email/Password     │              │ - Email/Password    │
   │ - Calls authApi.login()             │ - Full Name         │
   └──────────────────────┘              │ - Calls authApi.register()
        ↓                                │ - Creates profile   │
        └────────────────────────────┬──────────────────────┘
                                     ↓
                          ┌────────────────────────┐
                          │  authApi.ts (Service) │
                          │                        │
                          │ - login()              │
                          │ - register()           │
                          │ - logout()             │
                          │ - credentials: include │
                          └────────────────────────┘
                                     ↓
                 ┌───────────────────────────────────┐
                 │  Backend API                       │
                 │  https://yousefmohamed...          │
                 │                                    │
                 │ POST /users/login                  │
                 │ POST /users/register               │
                 │ POST /users/logout                 │
                 └───────────────────────────────────┘
                                     ↓
                          ┌────────────────────────┐
                          │  HTTP-Only Cookie      │
                          │  (Automatic)           │
                          │                        │
                          │  Returned by backend   │
                          │  Used in requests      │
                          └────────────────────────┘
                                     ↓
                          ┌────────────────────────┐
                          │  authStore (Zustand)   │
                          │                        │
                          │ - user: User | null    │
                          │ - isAuthenticated      │
                          │ - login()              │
                          │ - logout()             │
                          │                        │
                          │ Persists to:           │
                          │ localStorage['auth..'] │
                          └────────────────────────┘
                                     ↓
        ┌────────────────────────────┴────────────────────────┐
        ↓                                                      ↓
   ┌──────────────────────┐                        ┌─────────────────────┐
   │  ProtectedRoute.tsx  │                        │  App Pages (Ready)  │
   │                      │                        │                     │
   │ - Checks auth status │                        │ /en/dashboard       │
   │ - Redirects if no    │                        │ /en/profile         │
   │   user               │                        │ /en/chat            │
   │ - Wraps all pages    │                        │ /en/booking         │
   │                      │                        │ /en/diagnose        │
   └──────────────────────┘                        │ /en/records         │
        ↓                                          │ /en/settings        │
        │                                          └─────────────────────┘
        └──────────────────────┬────────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │   AppLayout.tsx      │
                    │   Sidebar.tsx        │
                    │   TopNav.tsx         │
                    │ - Shows user data    │
                    │ - Logout button      │
                    └──────────────────────┘
```

## Data Flow

### 1. Registration Flow
```
User fills form
    ↓
RegisterPage.tsx
    ↓
authApi.register({
  email: string,
  password: string,
  full_name: string
})
    ↓
API POST /users/register
    ↓
Backend validates & returns:
{
  id: number,
  email: string,
  full_name: string,
  role: string
}
    ↓
authStore.login(userData)
    ↓
Zustand saves to localStorage
    ↓
Redirect to /en/dashboard
```

### 2. Session Persistence Flow
```
Page refresh
    ↓
App.tsx initializes
    ↓
useAuthInit() hook runs
    ↓
Reads from localStorage['auth-store']
    ↓
Restores user to authStore
    ↓
ProtectedRoute checks auth status
    ↓
User stays on current page (stays logged in)
```

### 3. Logout Flow
```
User clicks logout button
    ↓
TopNav.tsx handleLogout()
    ↓
authApi.logout() (optional API call)
    ↓
authStore.logout()
    ↓
Zustand clears user from localStorage
    ↓
Redirect to /en/login
```

## State Management

### Auth Store (Zustand with Persistence)

```typescript
interface AuthState {
  user: User | null;              // Current logged-in user
  isAuthenticated: boolean;        // Login status
  isLoading: boolean;              // Loading state
  error: string | null;            // Error messages
  
  login(user: User): void;         // Set user on login
  logout(): void;                  // Clear user on logout
  setUser(user: User | null): void; // Manually set user
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  initializeAuth(user: User | null): void;
}

// Persisted to localStorage:
// Key: 'auth-store'
// Saves: { user, isAuthenticated }
```

### User Interface

```typescript
interface User {
  id: number;           // From backend
  email: string;        // From backend
  full_name: string;    // From backend
  role: string;         // From backend (e.g., 'patient')
}
```

## Authentication Flow

### Protected Route Logic

```
ProtectedRoute wrapper
    ↓
Check: useAuthStore().isAuthenticated
    ↓
If FALSE
├─ Redirect to /en/login
└─ Don't render children
    ↓
If TRUE
├─ Render protected component
├─ User can access page
└─ AppLayout, Sidebar, TopNav display
```

## Storage Strategy

### localStorage (Automatic via Zustand persist)

```javascript
// Key: 'auth-store'
// Saved automatically on login/logout

// Example content after login:
{
  "state": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "patient"
    },
    "isAuthenticated": true
  }
}

// Cleared on logout
{
  "state": {
    "user": null,
    "isAuthenticated": false
  }
}
```

### HTTP-Only Cookies (Backend)

```
Set-Cookie: jwt=token123; HttpOnly; Secure; SameSite=Lax
                         ↑
                Inaccessible to JavaScript
                Sent automatically with requests
```

## API Communication

### Request Headers

```javascript
{
  'Content-Type': 'application/json',
  // Credentials automatically included:
  // 'Cookie': jwt=token123 (from HTTP-only cookie)
}
```

### Response Handling

```javascript
// Success (200 OK)
{
  id: 1,
  email: "user@example.com",
  full_name: "John Doe",
  role: "patient"
}

// Error (4xx/5xx)
{
  message: "Invalid credentials",
  // Or similar error response
}
```

## Component Dependencies

```
App.tsx (root)
├─ useAuthInit() [runs on mount]
├─ LanguageProvider
│  └─ LocaleWrapper
│     └─ Routes
│        ├─ /en/login → LoginPage
│        ├─ /en/register → RegisterPage
│        └─ /en/* [Protected]
│           └─ ProtectedRoute
│              └─ AppLayout
│                 ├─ Sidebar
│                 ├─ TopNav [uses authStore]
│                 └─ Pages [use authStore]
│                    ├─ DashboardPage
│                    ├─ ProfilePage
│                    ├─ ChatPage
│                    └─ ... all other pages

authStore (Zustand)
├─ LoginPage [calls login()]
├─ RegisterPage [calls login()]
├─ TopNav [calls logout()]
├─ ProtectedRoute [checks isAuthenticated]
└─ useAuthInit [calls setUser()]

authApi (Service)
├─ LoginPage [calls login()]
├─ RegisterPage [calls register()]
└─ TopNav [calls logout()]
```

## Security Considerations

✅ **HTTP-Only Cookies** - JWT token cannot be accessed by JavaScript  
✅ **Credentials Included** - Cookies automatically sent with requests  
✅ **Session Persistence** - User data only in localStorage (not sensitive)  
✅ **Protected Routes** - All app pages require authentication  
✅ **No Token in Storage** - JWT stored only in HTTP-only cookie  
✅ **Logout Clears State** - Both frontend and backend clear session  

## Error Handling

```javascript
// Login/Register errors
try {
  const response = await fetch(...)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || `Failed: ${response.statusText}`)
  }
} catch (error) {
  // User sees error message
  setError(error.message)
}

// Logout errors (non-blocking)
try {
  await authApi.logout()
} catch (error) {
  // Log error but continue with local logout
  console.error(error)
} finally {
  authStore.logout() // Always clear locally
}
```

## Initialization Timeline

```
0ms   - App component mounts
        ↓
1ms   - useAuthInit hook runs
        ↓
2ms   - Checks localStorage for 'auth-store'
        ↓
3ms   - Restores user if found
        ↓
4ms   - authStore updated with user
        ↓
5ms   - ProtectedRoute checks auth
        ↓
6ms   - Routes render based on auth status
        ↓
∞     - User can navigate with session intact
```
