# Authentication Implementation Guide

## Overview

This document explains the JWT-based authentication system with persistent session management that prevents automatic logout on page refresh.

## Architecture

### Key Features
✅ **JWT-based authentication** - Tokens stored in HTTP-only cookies by backend
✅ **Session persistence** - User remains logged in after page refresh
✅ **Protected routes** - Automatic redirection to login for unauthorized users
✅ **Real API integration** - Connects to `https://yousefmohamed.pythonanywhere.com`
✅ **User profile data** - Displays real user information from signup

## Components

### 1. Auth API Service (`src/lib/api/authApi.ts`)
Handles all authentication API calls to the backend.

**Endpoints:**
- `POST /users/login` - User login
- `POST /users/register` - User registration  
- `POST /users/logout` - User logout
- `GET /users/me` - Get current user (optional)

**Features:**
- Uses `credentials: 'include'` to send/receive HTTP-only cookies
- Automatic error handling with user-friendly messages
- Console logging for debugging

### 2. Auth Store (`src/lib/store/authStore.ts`)
Zustand store with persistence middleware for managing authentication state.

**State:**
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null
}
```

**Key Methods:**
- `login(user)` - Set authenticated user
- `logout()` - Clear user and auth state
- `setUser(user)` - Update user data
- `setLoading(boolean)` - Loading state
- `setError(error)` - Error messages

**Persistence:**
- Automatically saves to `localStorage` under key `'auth-store'`
- Restores user data on app load
- Only persists `user` and `isAuthenticated` fields

### 3. Protected Route Component (`src/components/auth/ProtectedRoute.tsx`)
Wrapper component that enforces authentication requirements.

**Behavior:**
- Redirects unauthenticated users to `/login`
- Shows loading spinner during auth initialization
- Wraps all protected routes in App.tsx

**Usage:**
```tsx
<ProtectedRoute>
  <AppLayout />
</ProtectedRoute>
```

### 4. Auth Initialization Hook (`src/hooks/useAuthInit.ts`)
Initializes authentication state from localStorage on app load.

**Purpose:**
- Called once in `LocaleWrapper` on app startup
- Hydrates auth store from persisted localStorage data
- Restores user session across page refreshes

**How It Works:**
1. App loads → `LocaleWrapper` component mounts
2. `useAuthInit()` hook runs
3. Checks localStorage for stored auth state
4. If user exists and `isAuthenticated=true`, session is restored
5. Browser automatically sends JWT cookie with subsequent API calls

## User Flow

### Login
1. User enters email/password → `LoginPage.tsx`
2. Form submitted → `authApi.login()` called
3. Backend validates credentials, returns user object
4. User data stored in auth store → localStorage updated
5. JWT cookie set by backend (HTTP-only, automatic)
6. Redirected to `/dashboard`

### Registration
1. User enters full_name, email, password → `RegisterPage.tsx`
2. Form submitted → `authApi.register()` called
3. Backend creates account, returns user object
4. User data stored in auth store → localStorage updated
5. JWT cookie set by backend (HTTP-only, automatic)
6. Redirected to `/dashboard`

### Persistent Session
1. User logs in → auth data in localStorage + JWT cookie in browser
2. Page refresh → `useAuthInit()` restores user from localStorage
3. API calls include JWT cookie automatically
4. User stays logged in ✓

### Logout
1. User clicks logout button → `handleLogout()` in `TopNav.tsx`
2. `authApi.logout()` called to notify backend
3. Local auth store cleared with `logout()`
4. localStorage cleaned by Zustand
5. Redirected to `/login`

## Data Flow

```
Login Form
  ↓
authApi.login()
  ↓
Backend (/users/login)
  ↓
Returns: {id, email, full_name, role}
Sets: HTTP-only JWT cookie
  ↓
Auth Store: login(user)
  ↓
localStorage: auth-store
  ↓
Navigate to /dashboard
```

## Backend Response Format

The backend should return this format on successful login/register:

```json
{
  "id": 123,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "patient"
}
```

The JWT token is stored in an HTTP-only cookie by the backend and is automatically sent with all subsequent API requests.

## Important Notes

### Why No Token in localStorage?
- ✅ Token in HTTP-only cookie is more secure
- ✅ Browser automatically includes it in API requests
- ✅ JavaScript cannot access it (prevents XSS attacks)
- ✅ We only store user data in localStorage for persistence

### Why User Data in localStorage?
- ✅ Allows fast app startup (no extra API call needed)
- ✅ Shows user info immediately after refresh
- ✅ Real user data from signup shown in profile

### Cookie Behavior
- Backend sets `Set-Cookie: jwt=...` (HTTP-only, Secure flags)
- Browser automatically includes cookie in requests to `https://yousefmohamed.pythonanywhere.com`
- `credentials: 'include'` in fetch options enables this cross-origin behavior

## Files Modified/Created

### New Files
- `src/lib/api/authApi.ts` - Auth API service
- `src/components/auth/ProtectedRoute.tsx` - Protected route wrapper
- `src/hooks/useAuthInit.ts` - Auth initialization hook

### Modified Files
- `src/App.tsx` - Added ProtectedRoute wrapper, useAuthInit
- `src/lib/store/authStore.ts` - Added Zustand persist middleware
- `src/pages/auth/LoginPage.tsx` - Connected to real API
- `src/pages/auth/RegisterPage.tsx` - Connected to real API, removed extra fields
- `src/components/layout/TopNav.tsx` - Added logout API call, fixed user data fields
- `src/pages/profile/ProfilePage.tsx` - Display real user data

## Testing

### Test Case 1: Login
1. Go to `/en/login` or `/ar/login`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click login
5. Should redirect to dashboard with user data shown

### Test Case 2: Session Persistence
1. Login successfully
2. Refresh the page (Ctrl+R or F5)
3. User should still be logged in ✓
4. Profile should show logged-in user's name

### Test Case 3: Protected Routes
1. Logout or clear localStorage
2. Try to visit `/en/dashboard` directly
3. Should redirect to `/en/login` ✓

### Test Case 4: Logout
1. Login successfully
2. Click logout button (top-right)
3. Should redirect to login page
4. Refresh page should show login page ✓

## Troubleshooting

### User logged out after refresh
**Issue:** localStorage might be cleared
**Solution:** 
- Check browser dev tools → Application → localStorage
- Verify `auth-store` key exists
- Check for console errors

### API 401 Unauthorized errors
**Issue:** JWT cookie not being sent
**Solution:**
- Verify backend is setting cookie with `Set-Cookie` header
- Check `credentials: 'include'` in authApi.ts
- Ensure cookie domain matches (localhost/domain)

### "Cannot read property 'full_name' of null"
**Issue:** User data not loaded yet
**Solution:**
- Use optional chaining: `user?.full_name`
- Check if component has auth guard
- Verify useAuthInit() is called in app root

## Future Enhancements

- [ ] Token refresh mechanism (if backend supports it)
- [ ] Remember me checkbox for extended sessions
- [ ] Social login (Google, Apple, etc.)
- [ ] Two-factor authentication
- [ ] Password reset flow
- [ ] User profile API endpoint for additional data
