# Quick Reference Card - Authentication System

## 📌 Bookmark This!

### Core API Methods
```javascript
// Login
import { authApi } from '../lib/api/authApi'
const user = await authApi.login({ email, password })

// Register
const user = await authApi.register({ email, password, full_name })

// Logout
await authApi.logout()
```

### Auth Store Usage
```javascript
// Get auth store
import { useAuthStore } from '../lib/store/authStore'
const { user, isAuthenticated, login, logout } = useAuthStore()

// Check if logged in
if (useAuthStore().isAuthenticated) { ... }

// Get user data
const fullName = useAuthStore().user?.full_name
const email = useAuthStore().user?.email
```

### Protected Routes
```jsx
// In App.tsx
<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  <Route path="dashboard" element={<DashboardPage />} />
  {/* All nested routes protected */}
</Route>
```

---

## 🎯 Testing Flows

### Flow 1: Register & Test Persistence
```
/en/register 
  → Fill form
  → Click Register
  → See dashboard
  → Ctrl+F5 refresh
  → ✅ Still logged in
```

### Flow 2: Login & Logout
```
Click logout button
  → Go to /en/login
  → Enter credentials
  → Click Login
  → See dashboard
  → Click logout
  → ✅ Back to login page
```

### Flow 3: Protected Routes
```
Logout
  → Type /en/dashboard
  → ✅ Redirected to /en/login
  → Login first
  → ✅ Can access dashboard
```

---

## 📍 File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/api/authApi.ts` | API calls | 120 |
| `src/components/auth/ProtectedRoute.tsx` | Route guard | 27 |
| `src/hooks/useAuthInit.ts` | Session restore | 45 |
| `src/lib/store/authStore.ts` | State + persistence | 60 |
| `src/pages/auth/LoginPage.tsx` | Login form | ~50 |
| `src/pages/auth/RegisterPage.tsx` | Register form | ~50 |
| `src/components/layout/TopNav.tsx` | Navbar + logout | ~100 |

---

## 🔧 Common Tasks

### Display User Name
```jsx
const user = useAuthStore().user
<h1>Welcome, {user?.full_name}!</h1>
```

### Check Authentication
```jsx
const isAuth = useAuthStore().isAuthenticated
{isAuth ? <Dashboard /> : <LoginPage />}
```

### Get All User Data
```jsx
const user = useAuthStore().user
console.log(user?.id, user?.email, user?.full_name, user?.role)
```

### Handle Login
```jsx
import { authApi } from '../lib/api/authApi'
import { useAuthStore } from '../lib/store/authStore'

const handleLogin = async (email, password) => {
  try {
    const user = await authApi.login({ email, password })
    useAuthStore().login(user)
    navigate('/dashboard')
  } catch (error) {
    console.error(error.message)
  }
}
```

### Handle Logout
```jsx
const handleLogout = async () => {
  try {
    await authApi.logout()
  } finally {
    useAuthStore().logout()
    navigate('/login')
  }
}
```

---

## 🔐 Key Concepts

### Session Persistence
- User logged in → Data saved to localStorage
- Page refreshed → Data restored from localStorage
- User stays logged in ✓

### Protected Routes
- Route wrapped in ProtectedRoute
- Check isAuthenticated
- If false → redirect to /en/login
- If true → show page

### JWT Security
- Stored in HTTP-only cookie
- Can't be stolen by JavaScript
- Automatically sent with requests
- Secure by default

---

## 🆘 Debugging

### User Not Staying Logged In?
```javascript
// Check localStorage
JSON.parse(localStorage.getItem('auth-store'))
// Should have: { user: {...}, isAuthenticated: true }
```

### API Not Working?
```
1. Open DevTools → Network tab
2. Try login
3. Look for POST /users/login
4. Check response status & body
```

### User Data Not Showing?
```javascript
// Check auth store
useAuthStore().user
// Should have: { id, email, full_name, role }
```

---

## 📱 User States

### State 1: Not Logged In
```javascript
{
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}
// Can access: /login, /register, landing page
// Redirected from: /dashboard, /chat, etc.
```

### State 2: Logged In
```javascript
{
  user: {
    id: 1,
    email: 'user@example.com',
    full_name: 'John Doe',
    role: 'patient'
  },
  isAuthenticated: true,
  isLoading: false,
  error: null
}
// Can access: All protected pages
// Redirected from: /login, /register
```

### State 3: Loading
```javascript
{
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}
// Show: Loading spinner
// Don't navigate: Wait for completion
```

### State 4: Error
```javascript
{
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: 'Invalid credentials'
}
// Show: Error message to user
// Don't redirect: User can retry
```

---

## 🔌 API Endpoints

### Backend Must Have
```
POST /users/login
├─ Accept: { email, password }
└─ Return: { id, email, full_name, role }

POST /users/register
├─ Accept: { email, password, full_name }
└─ Return: { id, email, full_name, role }

POST /users/logout
└─ Clear session (optional)
```

---

## 🌐 Environment

### Configuration
```javascript
// In authApi.ts:
const API_BASE_URL = 'https://yousefmohamed.pythonanywhere.com'

// localStorage key:
localStorage key = 'auth-store'

// Cookie handling:
credentials: 'include' (automatic)
```

---

## 📋 Type Definitions

### User Type
```typescript
interface User {
  id: number
  email: string
  full_name: string
  role: string
}
```

### Auth State
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login(user: User): void
  logout(): void
  setLoading(loading: boolean): void
  setError(error: string | null): void
}
```

---

## ✅ Testing Checklist

- [ ] Registration works
- [ ] User stays logged in after refresh
- [ ] Login works with real credentials
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] User data displays correctly
- [ ] Error handling works
- [ ] localStorage has auth-store key

---

## 🎯 Features at a Glance

| Feature | Implemented | Where |
|---------|-------------|-------|
| Login | ✅ | LoginPage.tsx + authApi.ts |
| Register | ✅ | RegisterPage.tsx + authApi.ts |
| Session Persist | ✅ | authStore.ts + useAuthInit.ts |
| Route Guard | ✅ | ProtectedRoute.tsx |
| User Display | ✅ | TopNav.tsx + Dashboard |
| Logout | ✅ | TopNav.tsx |
| Error Handling | ✅ | LoginPage + RegisterPage |
| TypeScript | ✅ | All files |

---

## 🚀 One-Minute Summary

```
Your app now has:
✅ Real API integration for login/register
✅ Automatic session persistence
✅ Protected routes that require login
✅ Real user profile data from registration

How it works:
1. User registers → API creates account → Session saved
2. User refreshes → Session restored → Stays logged in
3. User logs out → Session cleared → Must login again
4. User visits /dashboard without login → Redirected to /login

To test:
1. Register with email, password, full name
2. Refresh page (should stay logged in)
3. Logout and login again (should work)
4. Try accessing /dashboard while logged out (redirected)

Everything ready to go! 🎉
```

---

## 📞 Quick Links

| Need | Action |
|------|--------|
| Testing guide | Read [READY_TO_TEST.md](./READY_TO_TEST.md) |
| Quick overview | Read [QUICK_START.md](./QUICK_START.md) |
| Architecture | Read [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Code examples | Read [CODE_REFERENCE.md](./CODE_REFERENCE.md) |
| Full guide | Read [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) |
| Visual summary | Read [VISUAL_SUMMARY.txt](./VISUAL_SUMMARY.txt) |

---

**Bookmark this card for quick reference!** 🔖
